const Bot = require('./Bot')

let brain = null
let bot = null

const setupResponses = () => {
  bot.on('/register', async (socket, [password, email]) => {
    if (!password || !email) {
      bot.sendSystem(socket, 'debes especificar un password y email')
      bot.sendSystem(socket, '/register tupassword tuemail')
      bot.sendSystem(socket, '(sin espacios el password o email)')
      return
    }
    const data = await bot.brain.hget(socket.userName, 'email')
    if (data) return bot.sendSystem(socket, 'Este username ya está registrado')
    const token = bot.auth.generateToken({ userName: socket.userName })
    await bot.brain.hset(socket.userName, 'password', password)
    await bot.brain.hset(socket.userName, 'email', email)
    bot.sendSystemData(socket, 'token', token, 'token')
    bot.sendSystem(socket, 'Listo')
    bot.sendSystem(socket, 'Ahora reclama tu username mandando el comando')
    bot.sendSystem(socket, '/password <password>')
    bot.sendSystem(socket, 'y así nadie más lo podrá usar hasta que te vayas')
  })
  bot.on('/password', async (socket, [password]) => {
    const data = await bot.brain.hget(socket.userName, 'password')
    if (data === password) {
      socket.reclaiming = false
      const sockets = bot.io.sockets.clients()
      Object.keys(sockets.connected).forEach(id => {
        const connectedSocket = sockets.connected[id]
        const [connId, connUser] = [connectedSocket.id, connectedSocket.userName]
        const [soId, soUser] = [socket.id, socket.userName]
        if (connId !== soId && connUser === soUser) {
          connectedSocket.reclaiming = true
        }
      })
      const token = bot.auth.generateToken({ userName: socket.userName })
      bot.sendSystem(socket, 'Listo ya puedes escribir')
      bot.sendSystemData(socket, 'token', token, 'token')
      return
    }
    bot.sendSystem(socket, 'Password incorrecto')
  })
  bot.on('/changePassword', async (socket, [password, newPass]) => {
    const data = await bot.brain.hget(socket.userName, 'password')
    if (data === password) {
      const token = bot.auth.generateToken({ userName: socket.userName })
      bot.sendSystem(socket, 'Contraseña actualizada')
      await bot.brain.hset(socket.userName, 'password', newPass)
      bot.sendSystemData(socket, 'token', token, 'token')
      return
    }
    bot.sendSystem(socket, 'Password incorrecto')
  })
  bot.on('/validateToken', async (socket, token) => {
    const isVerified = bot.auth.verifyToken(token)
    if (isVerified) {
      const userName = bot.auth.parseToken(token).meta.userName
      socket.userName = userName
      const password = await bot.brain.hget(socket.userName, 'password')
      bot.tryCommand('/password', socket, [password])
    }
  })
  bot.on('/getTokenData', (_socket, token) => {
    if (!token) return false
    const isVerified = bot.auth.verifyToken(token)
    if (isVerified) {
      return bot.auth.parseToken(token).meta
    }
    return false
  })
  bot.on('/clearShowcase', async (_socket, _params, user) => {
    const isAdmin = await bot.fnIsAdmin(user)
    if (!isAdmin) return
    bot.broadcastSystemData('chat-action', 'removeShowcase')
  })
  bot.on('/setupChat', async (socket, [key, value], user) => {
    const isAdmin = await bot.fnIsAdmin(user)
    if (!isAdmin) return
    if (!key || !value) {
      return bot.reportConfig(socket)
    }
    await bot.brain.hset('system-config', key, value)
    bot.reportConfig(socket)
  })
  bot.on('/clearSetupKey', async (socket, [key], user) => {
    const isAdmin = await bot.fnIsAdmin(user)
    if (!isAdmin || !key) return
    await bot.brain.hdel('system-config', key)
    bot.reportConfig(socket)
  })
  bot.on('/help', async (socket, params, user) => {
    bot.sendSystem(socket, '##########################################')
    bot.sendSystem(socket, 'COMANDOS DISPONIBLES:')
    bot.sendSystem(socket, '/register <tupassword> <tuemail>')
    bot.sendSystem(socket, '/password <password>')
    bot.sendSystem(socket, '/changePassword <password> <nuevopassword>')
    bot.sendSystem(socket, '/clear')
    bot.sendSystem(socket, '/logout')
    bot.sendSystem(socket, '/img')
    bot.sendSystem(socket, '/gif <url/a/la/imagen.gif>')
    bot.sendSystem(socket, '##########################################')
    if (!await bot.fnIsAdmin(user)) return
    bot.sendSystem(socket, 'COMANDOS PARA ADMIN')
    bot.sendSystem(socket, '/sudo')
    bot.sendSystem(socket, '/exit')
    bot.sendSystem(socket, '/pip')
    bot.sendSystem(socket, '/clearShowcase')
    bot.sendSystem(socket, '/setupChat')
    bot.sendSystem(socket, '##########################################')
  })
  bot.on('git', async (socket, params, user) => {
    const [action, ...rest] = params
    const execute = {
      checkout: ([_mod, branch = _mod]) => {
        bot.brain.hset('system-config', 'episode', branch)
      },
      users: ([action, ...rest]) => {
        const usersExecution = {
          add: async ([name, link, avatar]) => {
            if (name === undefined) return
            const usersRaw = await bot.brain.hget('system-config', 'guests')
            const users = JSON.parse(
              Buffer.from(usersRaw, 'base64').toString('utf8')
            )
            users.push({ name, link, avatar })
            const guest = Buffer.from(JSON.stringify(users)).toString('base64')
            bot.brain.hset('system-config', 'guests', guest)
          },
          del: async ([username]) => {
            const usersRaw = await bot.brain.hget('system-config', 'guests')
            const users = JSON.parse(
              Buffer.from(usersRaw, 'base64').toString('utf8')
            )
            let guests = users.filter(u => u.name !== username)
            guests = Buffer.from(JSON.stringify(guests)).toString('base64')
            bot.brain.hset('system-config', 'guests', guests)
          }
        }
        if (!usersExecution[action]) return
        usersExecution[action](rest)
      }
    }
    if (!execute[action]) return
    execute[action](rest)
    bot.commands['/setupChat'](socket, [], user)
  })
}

const sendSystem = (socket, message) => {
  bot.sendSystem(socket, message)
}
const sendSystemData = (socket, key, value) => {
  bot.sendSystemData(socket, key, value)
}
const broadcastSystem = (socket, message) => {
  bot.broadcastSystem(socket, message)
}
const fnIsAdmin = user => bot.fnIsAdmin(user)

const sendRegister = (socket, currentUser) => {
  bot.sendSystem(socket, `Este username (${currentUser}) NO está registrado`)
  bot.sendSystem(socket, 'Si quieres registrarlo, manda')
  bot.sendSystem(socket, '/register <tu_password> <tu_email>')
  return true
}

const sendReclaim = (socket, currentUser) => {
  bot.sendSystem(socket, `Este username (${currentUser}) ya está registrado en el chat.`)
  bot.sendSystem(socket, 'Si tu eres quien lo registró, puedes reclamar el username mandando:')
  bot.sendSystem(socket, '/password <tu_password>')
}

const validateNewUser = async (socket, currentUser) => {
  const userData = await brain.hgetall(currentUser)
  socket.userName = currentUser
  if (userData) {
    if (userData.online === 'true') {
      socket.reclaiming = true
    } else {
      await brain.hset(currentUser, 'online', true)
    }
    if (!userData.email) return sendRegister(socket, currentUser)
    return sendReclaim(socket, currentUser)
  } else {
    await brain.hset(currentUser, 'online', true)
    return sendRegister(socket, currentUser)
  }
}

const validateToken = async (socket, token) => {
  return bot.tryCommand('/validateToken', socket, token)
}
const getTokenData = (token) => {
  return bot.tryCommand('/getTokenData', null, token)
}
const uuid = () => {
  return bot.uuid()
}

const tryCommands = (message, socket, user) => {
  const [command, ...params] = message.split(' ')
  bot.tryCommand(command, socket, params, user)
}

module.exports = {
  sendSystem,
  sendSystemData,
  broadcastSystem,
  sendRegister,
  sendReclaim,
  validateNewUser,
  validateToken,
  getTokenData,
  tryCommands,
  fnIsAdmin,
  uuid,
  initializeBrain: (inputBrain, io) => {
    brain = inputBrain
    bot = new Bot(brain, io)
    setupResponses()
  }
}

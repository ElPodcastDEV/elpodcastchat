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
  bot.on('/mypts', async (socket, params, user) => {
    const userPts = ~~await bot.brain.hget(user, 'pts')
    bot.sendSystem(socket, '--')
    bot.sendSystem(socket, `TIENES ${userPts} PUNTOS ACUMULADOS`)
    bot.sendSystem(socket, '--')
    bot.sendSystem(socket, 'Los puntos se acumulan mientras estés en el chat')
    bot.sendSystem(socket, 'durante la transmisión en vivo de El Podcast DEV')
    bot.sendSystem(socket, 'Puedes usarlos mandando un mensaje al aire con el comando')
    bot.sendSystem(socket, '!s tu mensaje')
    bot.sendSystem(socket, '(mandar un mensaje te cuesta 100 puntos)')
  })
  bot.on('/help', async (socket, params, user) => {
    bot.sendSystem(socket, '##########################################')
    bot.sendSystem(socket, 'COMANDOS DISPONIBLES:')
    bot.sendSystem(socket, '/register <tupassword> <tuemail>')
    bot.sendSystem(socket, '/password <password>')
    bot.sendSystem(socket, '/changePassword <password> <nuevopassword>')
    bot.sendSystem(socket, '/clear')
    bot.sendSystem(socket, '/logout')
    bot.sendSystem(socket, '/mypts')
    bot.sendSystem(socket, '/img')
    bot.sendSystem(socket, '/gif <url/a/la/imagen.gif>')
    bot.sendSystem(socket, '/git status')
    bot.sendSystem(socket, '/git titles add "El título que quieras proponer"')
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
    const isAdmin = await bot.fnIsAdmin(user)
    const execute = {
      checkout: ([_mod, branch = _mod]) => {
        if (!isAdmin) return
        bot.brain.hset('system-config', 'episode', branch)
        bot.commands['/setupChat'](socket, [], user)
      },
      config: ([key, ...rest]) => {
        if (!rest) return
        if (!isAdmin) return
        const value = rest.join(' ')
        brain.hset('system-config', key, value)
        bot.commands['/setupChat'](socket, [], user)
      },
      commit: ([_mod, ..._message]) => {
        if (!_message) return
        if (!isAdmin) return
        const message = _message.join(' ')
        brain.hset(
          'system-config',
          'branchMessage',
          message.replace(/^"(.*)"$/, '$1')
        )
        bot.commands['/setupChat'](socket, [], user)
      },
      push: async _ => {
        if (!isAdmin) return
        bot.brain.del('system-config-titles')
        bot.brain.del('system-config')
        bot.brain.hset('system-config', 'branchMessage', '')
        bot.brain.hset('system-config', 'episode', 'master')
        bot.brain.hset('system-config', 'guests', 'W10=')
        bot.brain.hset('system-config', 'stream', '')
        bot.broadcastSystem('Pusheado a origin')
      },
      cleardb: async _ => {
        bot.broadcastSystem('Cleaning DB')
        if (!isAdmin) return
        const brain = bot.brain
        let keys = (await brain.keys('*')).filter(key => key !== 'system-config')
        const arr = []
        keys.forEach(key => {
          arr.push(brain.type(key))
        })
        const types = await Promise.all(arr)
        arr.length = 0
        keys = keys
          .map((key, index) => [key, types[index]])
          .filter(([, type]) => type === 'hash')
          .map(([key]) => key)
        keys.forEach(key => {
          arr.push(brain.hget(key, 'password'))
        })
        const passwords = await Promise.all(arr)
        const [delKeys, resetKeys] = [[], []]
        keys
          .map((key, index) => [key, passwords[index]])
          .forEach(([key, password]) => {
            password === null ? delKeys.push(key) : resetKeys.push(key)
          })
        delKeys
          .forEach(key => {
            bot.sendSystem(socket, `Expiring temp user: ${key}`)
            brain.del(key)
          })
        const pAdmins = []
        resetKeys
          .forEach(key => {
            bot.sendSystem(socket, `Expiring user pts: ${key}`)
            brain.hset(key, 'pts', 0)
            pAdmins.push(brain.hget(key, 'permissions'))
          })
        const admins = await Promise.all(pAdmins)
        resetKeys
          .map((key, index) => [key, admins[index]])
          .filter(([, permissions]) => permissions !== null)
          .map(([key, value]) => [key, JSON.parse(value)])
          .filter(([, { isAdmin }]) => isAdmin === true)
          .forEach(([key]) => {
            bot.sendSystem(socket, `Resetting admin pts: ${key}`)
            brain.hset(key, 'pts', 1e6)
          })
        bot.broadcastSystem('Database cleared')
      },
      titles: ([action, ...rest]) => {
        const titlesExecution = {
          add: _title => {
            const title = _title.join(' ').replace(/^"(.*)"$/, '$1')
            bot.brain.lpush('system-config-titles', `${user}: ${title}`)
            bot.sendSystem(socket, 'Título recibido')
          },
          del: _ => {
            if (!isAdmin) return
            bot.brain.del('system-config-titles')
            bot.sendSystem(socket, 'Títulos eliminados')
          }
        }
        if (!titlesExecution[action]) return
        titlesExecution[action](rest)
      },
      users: ([action, ...rest]) => {
        if (!isAdmin) return
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
        bot.commands['/setupChat'](socket, [], user)
      },
      status: async socket => {
        const data = await brain.hgetall('system-config')
        const titles = await brain.lrange('system-config-titles', 0, -1)
        bot.broadcastResponse(`On branch ${data.episode}`)
        if (titles.length > 0) {
          bot.broadcastSystem('Títulos potenciales:')
          titles.forEach(title => {
            bot.broadcastSystem(`- ${title}`)
          })
        }
        bot.broadcastSystem(data.branchMessage)
      }
    }
    if (!execute[action]) return
    execute[action](rest)
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

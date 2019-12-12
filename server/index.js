const Brain = require('./brain')
const {
  sendSystem,
  broadcastSystem,
  validateNewUser,
  validateToken,
  getTokenData,
  tryCommands,
  initializeBrain
} = require('./responses')

const { io } = require('./webserver')

const brain = new Brain()
initializeBrain(brain, io)

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const fnIsAdmin = async (msg) => {
  const { userFromToken: userName } = JSON.parse(msg)
  if (!userName) return false
  const permissions = await brain.hget(
    userName, 'permissions'
  ) || JSON.stringify({})
  const { isAdmin } = JSON.parse(permissions)
  return isAdmin
}

const customActions = {
  deleteMessage: async (_socket, msg) => {
    if (await fnIsAdmin(msg)) {
      io.emit('chat message', msg)
    }
  },
  sendImage: async (socket, msg) => {
    if (await fnIsAdmin(msg)) {
      io.emit('chat message', msg)
    } else {
      sendSystem(
        socket,
        'Solo los admins pueden mandar imágenes'
      )
    }
  },
  userNameChange: async (socket, msg) => {
    const { current, token } = JSON.parse(msg)
    if (!socket.reclaiming && socket.userName) {
      brain.hset(socket.userName, 'online', false)
      broadcastSystem(`${socket.userName} se ha ido`)
    }
    socket.reclaiming = false
    await validateNewUser(socket, current)
    if (token) {
      validateToken(socket, token)
      broadcastSystem(`${socket.userName} se ha unido!`)
    } else if (!socket.reclaiming) {
      broadcastSystem(`${socket.userName} se ha unido!`)
    }
  }
}

io.on('connection', socket => {
  socket.on('disconnect', async () => {
    if (socket.reclaiming) return
    if (socket.userName) {
      await brain.hset(socket.userName, 'online', false)
      broadcastSystem(`${socket.userName} se ha ido`)
    }
  })

  socket.on('chat message', async msg => {
    const { message, token, messageType } = JSON.parse(msg)
    const { userName: userFromToken } = getTokenData(token)
    if (message && message[0] === '/') return tryCommands(message, socket)
    if (socket.reclaiming) {
      sendSystem(
        socket,
        'Actualmente no puedes mandar mensajes, hasta que cambies de nick o lo reclames'
      )
      return
    }

    const nMsg = JSON.stringify({
      ...JSON.parse(msg),
      uid: uuid(),
      userFromToken
    })

    if (customActions[messageType]) {
      return customActions[messageType](socket, nMsg)
    }

    io.emit('chat message', nMsg)
  })
})

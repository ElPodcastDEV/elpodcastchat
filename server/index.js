const Brain = require('./brain')
const {
  sendSystem,
  sendSystemData,
  broadcastSystem,
  validateNewUser,
  validateToken,
  getTokenData,
  tryCommands,
  initializeBrain,
  fnIsAdmin,
  uuid
} = require('./responses')

const { io } = require('./webserver')

const brain = new Brain()
initializeBrain(brain, io)

const customActions = {
  deleteMessage: async (_socket, msg) => {
    const user = JSON.parse(msg)
    if (await fnIsAdmin(user.userFromToken)) {
      io.emit('chat message', msg)
    }
  },
  sendImage: async (_socket, msg) => {
    io.emit('chat message', msg)
  },
  sendImageVIP: async (socket, msg) => {
    const user = JSON.parse(msg)
    if (await fnIsAdmin(user.userFromToken)) {
      io.emit('chat message', msg)
    } else {
      sendSystem(
        socket,
        'Solo los admins pueden mandar imágenes'
      )
    }
  },
  logout: async (socket) => {
    if (!socket.reclaiming && socket.userName) {
      brain.hset(socket.userName, 'online', false)
      broadcastSystem(`${socket.userName} se ha ido`)
    }
  },
  userNameChange: async (socket, msg) => {
    const { current, token } = JSON.parse(msg)
    if (current === 'El Bot') {
      sendSystem(socket, 'Nombre de usuario reservado')
      return sendSystemData(socket, 'triggerLogout')
    }
    socket.reclaiming = false
    await validateNewUser(socket, current)
    if (token) {
      validateToken(socket, token)
      broadcastSystem(`${socket.userName} se ha unido!`)
    } else if (!socket.reclaiming) {
      broadcastSystem(`${socket.userName} se ha unido!`)
    }
  },
  requestSetup: async (socket) => {
    const setupData = await brain.hgetall('system-config')
    sendSystemData(
      socket,
      'setupChat',
      JSON.stringify(setupData)
    )
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
    if (message && message[0] === '/') {
      return tryCommands(message, socket, userFromToken)
    }
    if (message && message.slice(0, 4) === 'git ') {
      tryCommands(message, socket, userFromToken)
    }
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

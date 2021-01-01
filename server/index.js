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
  textToSpeech: async (socket, msg) => {
    const { userFromToken } = JSON.parse(msg)
    if (!userFromToken) return
    const userPts = ~~await brain.hget(userFromToken, 'pts')
    const newPts = userPts - 100
    if (newPts < 0) {
      return [
        'Necesitas por lo menos 100 puntos para mandar un mensaje al aire',
        `Actualmente tienes ${userPts} puntos acumulados`,
        'Para más información escribe /mypts'
      ].forEach(systemMsg => {
        sendSystem(socket, systemMsg)
      })
    }
    await brain.hset(userFromToken, 'pts', newPts)
    io.emit('chat message', msg)
    sendSystem(socket, `Te quedan: ${newPts} puntos`)
  },
  requestSetup: async (socket, msg) => {
    const { userFromToken } = JSON.parse(msg)
    const setupData = await brain.hgetall('system-config')
    const isEpOnline = setupData.online === 'true'
    acumPts(socket, userFromToken, isEpOnline)
    sendSystemData(
      socket,
      'setupChat',
      JSON.stringify(setupData)
    )
  }
}

const acumPts = async (socket, user, isOnline) => {
  if (!user || !isOnline) return
  let userPts = ~~await brain.hget(user, 'pts')
  await brain.hset(user, 'pts', userPts + 1)
  userPts = ~~await brain.hget(user, 'pts')
  if (userPts % 50 !== 0) return
  sendSystem(
    socket,
    `Tienes ${userPts} puntos acumulados!`
  )
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

    const nMsg = JSON.stringify({
      ...JSON.parse(msg),
      uid: uuid(),
      userFromToken
    })

    if (message && message[0] === '/') {
      return tryCommands(message, socket, userFromToken)
    }
    if (message && message.slice(0, 3) === '!s ') {
      return customActions.textToSpeech(socket, nMsg)
    }
    if (message && message.slice(0, 4) === 'git ') {
      tryCommands(message, socket, userFromToken)
    }
    if (socket.reclaiming) {
      return sendSystem(
        socket,
        'Actualmente no puedes mandar mensajes, hasta que cambies de nick o lo reclames'
      )
    }
    if (customActions[messageType]) {
      return customActions[messageType](socket, nMsg)
    }
    io.emit('chat message', nMsg)
  })
})

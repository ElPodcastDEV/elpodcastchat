const Bot = require('./bot')

let brain = null
let bot = null

const sendSystem = (socket, message) => {
  bot.sendSystem(socket, message)
}
const broadcastSystem = (socket, message) => {
  bot.broadcastSystem(socket, message)
}

const sendRegister = (socket, currentUser) => {
  bot.sendSystem(socket, `Este username (${currentUser}) NO está registrado`)
  bot.sendSystem(socket, 'Si quieres registrarlo, manda')
  bot.sendSystem(socket, '/register <tu_password> <tu_email>')
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
    sendReclaim(socket, currentUser)
  } else {
    sendRegister(socket, currentUser)
    await brain.hset(currentUser, 'online', true)
  }
}

const validateToken = async (socket, token) => {
  bot.on('/validateToken', socket, token)
}

const tryCommands = (message, socket) => {
  const [command, ...params] = message.split(' ')
  bot.on(command, socket, params)
}

module.exports = {
  sendSystem,
  broadcastSystem,
  sendRegister,
  sendReclaim,
  validateNewUser,
  validateToken,
  tryCommands,
  initializeBrain: (inputBrain, io) => {
    brain = inputBrain
    bot = new Bot(brain, io)
  }
}

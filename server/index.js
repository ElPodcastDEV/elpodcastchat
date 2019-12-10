const { resolve } = require('path')
const express = require('express')
const Http = require('http')
const Io = require('socket.io')
const Brain = require('./brain')
const getStatus = require('./shoutcast')
const {
  sendSystem,
  validateNewUser,
  validateToken,
  tryCommands,
  initializeBrain
} = require('./responses')

const app = express()
const http = Http.createServer(app)
const io = Io(http)
const port = 80
const brain = new Brain()

initializeBrain(brain, io)

http.listen(port, async () => {
  console.log(`listening on *:${port}`)
})

io.on('connection', socket => {
  socket.on('disconnect', async () => {
    if (socket.reclaiming) return
    if (socket.userName) await brain.hset(socket.userName, 'online', false)
  })
  socket.on('chat message', msg => {
    const { message } = JSON.parse(msg)
    if (message[0] === '/') return tryCommands(message, socket)
    if (socket.reclaiming) {
      sendSystem(
        socket,
        'Actualmente no puedes mandar mensajes, hasta que cambies de nick o lo reclames'
      )
      return
    }
    io.emit('chat message', msg)
  })
  socket.on('userNameChange', msg => {
    const { prev, current, token } = JSON.parse(msg)
    if (!socket.reclaiming && socket.userName) {
      brain.hset(socket.userName, 'online', false)
    }
    socket.reclaiming = false
    validateNewUser(socket, current)
    if (token) {
      validateToken(socket, token)
    }
  })
})

app.use(express.static('assets'))

app.get('/status', async (req, res) => {
  const status = await getStatus('http://188.165.240.90:8292/index.html?sid=1')
  res.json({ status })
})

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../assets/index.html'))
})

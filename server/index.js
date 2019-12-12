const { resolve } = require('path')
const express = require('express')
const Http = require('http')
const Io = require('socket.io')
const Brain = require('./brain')
const getStatus = require('./shoutcast')
const {
  sendSystem,
  broadcastSystem,
  validateNewUser,
  validateToken,
  getTokenData,
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

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
   var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
   return v.toString(16)
  })
}

const fisAdmin = async (socket) => {
  const perm = await brain.hget(
    socket.userName, 'permissions'
  ) || JSON.stringify({})
  const { isAdmin } = JSON.parse(perm)
  return isAdmin
}

io.on('connection', socket => {
  socket.on('disconnect', async () => {
    if (socket.reclaiming) return
    if (socket.userName) {
      await brain.hset(socket.userName, 'online', false)
      broadcastSystem(`${socket.userName} se ha ido`)
    }
  })
  socket.on('deleteMessage', async msg => {
    const { msgId, token } = JSON.parse(msg)
    const userFromToken = getTokenData(socket, token)
    if (await fisAdmin(socket)) {
      io.emit('deleteMessage', msgId)
    }
  })
  socket.on('chat message', async msg => {
    const { username: uname, message, token } = JSON.parse(msg)
    const userFromToken = getTokenData(socket, token)
    const username = userFromToken || uname

    if (message[0] === '/') return tryCommands(message, socket)
    if (socket.reclaiming) {
      sendSystem(
        socket,
        'Actualmente no puedes mandar mensajes, hasta que cambies de nick o lo reclames'
      )
      return
    }

    const nMsg = JSON.stringify({ username, message, uid: uuid() })

    if (username === '!blobImg!') {
      if (await fisAdmin(socket)) {
        io.emit('chat message', nMsg)
      } else {
        sendSystem(
          socket,
          'Solo los admins pueden mandar imágenes'
        )
      }
      return
    }

    io.emit('chat message', nMsg)
  })
  socket.on('userNameChange', async msg => {
    const { prev, current, token } = JSON.parse(msg)
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

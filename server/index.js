const { resolve } = require('path')
const express = require('express')
const Http = require('http')
const Io = require('socket.io')
const Brain = require('./brain')
const getStatus = require('./shoutcast')

const app = express()
const http = Http.createServer(app)
const io = Io(http)
const port = 80
const brain = new Brain()

http.listen(port, async () => {
  console.log(`listening on *:${port}`)
})

io.on('connection', socket => {
  socket.on('disconnect', () => {})
  socket.on('chat message', msg => {
    io.emit('chat message', msg)
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

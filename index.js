const { resolve } = require('path')
const express = require('express')
const Http = require('http')
const Io = require('socket.io')

const app = express()
const http = Http.createServer(app)
const io = Io(http)
const port = process.env.PORT || 3200

http.listen(port, function () {
  console.log(`listening on *:${port}`)
})

io.on('connection', socket => {
  socket.on('disconnect', () => {})
  socket.on('chat message', msg => {
    io.emit('chat message', msg)
  })
})

app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, './index.html'))
})

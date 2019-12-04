const { resolve } = require('path')
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

http.listen(process.ENV.port || 3200, function () {
  console.log('listening on *:3200')
})

io.on('connection', socket => {
  socket.on('disconnect', () => {})
  socket.on('chat message', msg => {
    io.emit('chat message', msg)
  })
})

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, './index.html'))
})

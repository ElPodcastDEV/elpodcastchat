const { resolve } = require('path')
const express = require('express')
const Io = require('socket.io')
const Http = require('http')

const app = express()
const http = Http.createServer(app)
const io = Io(http)
const port = process.env.PORT || 80

http.listen(port, async () => {
  console.log(`listening on *:${port}`)
})

app.use([express.static('dist'), express.static('server/favicon')])

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../dist/index.html'))
})

module.exports = {
  io
}

const { resolve } = require('path')
const express = require('express')
const Io = require('socket.io')
const Http = require('http')
const getStatus = require('./shoutcast')

const app = express()
const http = Http.createServer(app)
const io = Io(http)
const port = 80

http.listen(port, async () => {
  console.log(`listening on *:${port}`)
})

app.use(express.static('dist'))

app.get('/status', async (req, res) => {
  const status = await getStatus('http://188.165.240.90:8292/index.html?sid=1')
  res.json({ status })
})

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../dist/index.html'))
})

module.exports = {
  io
}

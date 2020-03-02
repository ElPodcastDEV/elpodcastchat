const { resolve } = require('path')
const express = require('express')
const Io = require('socket.io')
const Http = require('http')

const app = express()
const http = Http.createServer(app)
const io = Io(http)
const port = process.env.PORT || 80
const imageUrl = 'http://cdn.simplecast.com/images/20122399-3919-4089-b540-10f66a258c04/8734f16b-187a-41cb-9a6f-34ff0f2ee6c5/640x640/1551986909artwork.jpg'

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

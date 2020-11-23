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

app.get('/site.webmanifest', (req, res) => {
  res.json({
    name: 'Live El Podcast DEV',
    short_name: 'EPD Live',
    theme_color: '#232638',
    background_color: '#232638',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [57, 60, 72, 76, 114, 120, 144, 152, 180].map(size => ({
      src: `/apple-icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png'
    }))
  })
})

module.exports = {
  io
}

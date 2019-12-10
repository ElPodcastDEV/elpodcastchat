const Auth = require('./Auth')

class Bot {
  constructor (inputBrain, io) {
    this.brain = inputBrain
    this.io = io
    this.auth = new Auth({secret: process.env.SECRET})
    this.commands = {
      '/register': async (socket, [password, email]) => {
        const data = await this.brain.hget(socket.userName, 'email')
        if (data) return this.sendSystem(socket, 'Este username ya está registrado')
        const token = this.auth.generateToken({ userName: socket.userName })
        await this.brain.hset(socket.userName, 'password', password)
        await this.brain.hset(socket.userName, 'email', email)
        this.brain.hset(socket.userName, 'token', token)
        this.sendSystemData(socket, 'token', token)
        this.sendSystem(socket, 'Listo, puedes reclamar este nick usando /password <password>')
      },
      '/password': async (socket, [password]) => {
        const data = await this.brain.hget(socket.userName, 'password')
        if (data === password) {
          socket.reclaiming = false
          const sockets = io.sockets.clients()
          const otherUsers = []
          Object.keys(sockets.connected).forEach(id => {
            const connectedSocket = sockets.connected[id]
            if (connectedSocket.id !== socket.id) {
              connectedSocket.reclaiming = true
            }
          })
          const token = this.auth.generateToken({ userName: socket.userName })
          this.brain.hset(socket.userName, 'token', token)
          this.sendSystem(socket, 'Listo ya puedes escribir')
          this.sendSystemData(socket, 'token', token)
          return
        }
        this.sendSystem(socket, 'Password incorrecto')
      },
      '/validateToken': async (socket, token) => {
        const isVerified = this.auth.verifyToken(token)
        if (isVerified) {
          const userName = this.auth.parseToken(token).meta.userName
          socket.userName = userName
          const password = await this.brain.hget(socket.userName, 'password')
          this.on('/password', socket, [password])
        }
      }
    }
  }
  on (command, socket, params) {
    this.commands[command](socket, params)
  }
  sendSystem (socket, message) {
    socket.emit('chat message', JSON.stringify({
      username: 'SYSTEM',
      message
    }))
  }
  sendSystemData (socket, key, value) {
    socket.emit('system message', JSON.stringify({
      key, value
    }))
  }
}

module.exports = Bot

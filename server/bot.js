const Auth = require('./Auth')

class Bot {
  constructor (inputBrain, io) {
    this.brain = inputBrain
    this.io = io
    this.auth = new Auth({secret: process.env.SECRET})
    this.commands = {
      '/register': async (socket, [password, email]) => {
        if (!password || !email) {
          this.sendSystem(socket, 'debes especificar un password y email')
          this.sendSystem(socket, '/register tupassword tuemail')
          this.sendSystem(socket, '(sin espacios el password o email)')
          return
        }
        const data = await this.brain.hget(socket.userName, 'email')
        if (data) return this.sendSystem(socket, 'Este username ya está registrado')
        const token = this.auth.generateToken({ userName: socket.userName })
        await this.brain.hset(socket.userName, 'password', password)
        await this.brain.hset(socket.userName, 'email', email)
        this.sendSystemData(socket, 'token', token)
        this.sendSystem(socket, 'Listo')
        this.sendSystem(socket, 'Ahora reclama tu username mandando el comando')
        this.sendSystem(socket, '/password <password>')
        this.sendSystem(socket, 'y así nadie más lo podrá usar hasta que te vayas')
      },
      '/password': async (socket, [password]) => {
        const data = await this.brain.hget(socket.userName, 'password')
        if (data === password) {
          socket.reclaiming = false
          const sockets = io.sockets.clients()
          const otherUsers = []
          Object.keys(sockets.connected).forEach(id => {
            const connectedSocket = sockets.connected[id]
            const [connId, connUser] = [connectedSocket.id, connectedSocket.userName]
            const [soId, soUser] = [socket.id, socket.userName]
            if (connId !== soId && connUser === soUser) {
              connectedSocket.reclaiming = true
            }
          })
          const token = this.auth.generateToken({ userName: socket.userName })
          this.sendSystem(socket, 'Listo ya puedes escribir')
          this.sendSystemData(socket, 'token', token)
          return
        }
        this.sendSystem(socket, 'Password incorrecto')
      },
      '/changePassword': async (socket, [password, newPass]) => {
        const data = await this.brain.hget(socket.userName, 'password')
        if (data === password) {
          const token = this.auth.generateToken({ userName: socket.userName })
          this.sendSystem(socket, 'Contraseña actualizada')
          await this.brain.hset(socket.userName, 'password', newPass)
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
      },
      '/getTokenData': (socket, token) => {
        if (!token) return false
        const isVerified = this.auth.verifyToken(token)
        if (isVerified) {
          return this.auth.parseToken(token).meta.userName
        }
        return false
      }
    }
  }
  on (command, socket, params) {
    if (!this.commands[command])
      return this.sendSystem(socket, `command ${command} no existe`)
    this.commands[command](socket, params)
  }
  sendSystem (socket, message) {
    socket.emit('chat message', JSON.stringify({
      username: 'SYSTEM',
      message
    }))
  }
  broadcastSystem (message) {
    this.io.emit('chat message', JSON.stringify({
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

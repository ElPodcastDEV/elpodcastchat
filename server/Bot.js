const Auth = require('./Auth')

class Bot {
  constructor (inputBrain, io) {
    this.brain = inputBrain
    this.io = io
    this.auth = new Auth({ secret: process.env.SECRET })
    this.commands = {}
  }

  async reportConfig (socket) {
    const current = await this.brain.hgetall('system-config')
    this.sendSystem(socket, JSON.stringify(current))
  }

  async getConfig () {
    const conf = this.brain.hgetall('system-config')
    if (conf === null) return conf
    return {
      episode: 1,
      hosts: []
    }
  }

  on (command, callback) {
    this.commands[command] = callback
  }

  tryCommand (command, socket, params, user) {
    if (!this.commands[command]) {
      return this.sendSystem(socket, `command ${command} no existe`)
    }
    return this.commands[command](socket, params, user)
  }

  sendSystem (socket, message) {
    socket.emit('chat message', JSON.stringify({
      username: 'SYSTEM',
      uid: this.uuid(),
      message
    }))
  }

  broadcastSystem (message) {
    this.io.emit('chat message', JSON.stringify({
      username: 'SYSTEM',
      uid: this.uuid(),
      message
    }))
  }

  sendSystemData (socket, action, value, key = 'chat-action') {
    socket.emit('system message', JSON.stringify({
      key,
      action,
      value
    }))
  }

  broadcastSystemData (key, action, value) {
    this.io.emit('system message', JSON.stringify({
      key, action, value
    }))
  }

  uuid () {
    const uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    return `${new Date().getTime()}-${uid}`
  }

  async fnIsAdmin (userName) {
    if (!userName) return false
    const permissions = await this.brain.hget(
      userName, 'permissions'
    ) || JSON.stringify({})
    const { isAdmin } = JSON.parse(permissions)
    return isAdmin
  }
}

module.exports = Bot

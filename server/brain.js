const { promisify } = require('util')
const redis = require("redis")

class Brain {
  constructor() {
    const client = redis.createClient({ host: 'redis', port: 6379 })
    new Array(...['get', 'set', 'hgetall', 'hset', 'hget']).forEach(action => {
      this[action] = promisify(client[action]).bind(client)
    })
    client.on('error', console.log)
  }
}

module.exports = Brain

const { promisify } = require('util')
const redis = require('redis')

class Brain {
  constructor () {
    const client = redis.createClient({ host: process.env.DB, port: 6379 })
    new Array(
      ...[
        'get',
        'set',
        'del',
        'hgetall',
        'hset',
        'hget',
        'hdel',
        'lpush',
        'lrange'
      ]
    ).forEach(action => {
      this[action] = promisify(client[action]).bind(client)
    })
    client.on('error', console.log)
  }
}

module.exports = Brain

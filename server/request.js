const http = require('http')

const get = url => {
  const promise = new Promise((resolve) => {
    http.get(url, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
        return resolve({ data })
      })
    }).on('error', (err) => {
      return resolve({ error: err.message })
    })
  })
  return promise
}

module.exports = {
  get
}

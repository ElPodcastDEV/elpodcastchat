const http = require('http')

const getStatus = url => {
  const promise = new Promise((resolve, reject) => {
    http.get(url, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
        const lowerDel = 'Stream Status: </td><td><b>'
        const upperDel = '</b></td></tr><tr valign="top"><td>Listener Peak:'
        const init = data.indexOf(lowerDel)
        const end = data.indexOf(upperDel)
        const res = [...data]
          .slice(init + lowerDel.length, end)
          .join('')
        return resolve(res)
      })

    }).on("error", (err) => {
      return reject(err.message)
    })
  })
  return promise
}

module.exports = getStatus

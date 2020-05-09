class Database {
  constructor (table) {
    this.table = table
    const request = indexedDB.open('mydatabase', 1)
    request.onerror = event => {
      console.error(event)
    }
    request.onupgradeneeded = event => {
      const db = event.target.result
      this._db = db.createObjectStore(this.table)
    }
    request.onsuccess = _ => {
      this._db = request.result
    }
  }

  async set (key, data) {
    if (!this._db) {
      return setTimeout(() => {
        return this.set(key, data)
      }, 100)
    }
    const prev = await this.get(key)
    const storer = this._db
      .transaction([this.table], 'readwrite')
      .objectStore(this.table)
    if (prev) return storer.put(data, key)
    storer.add(data, key)
  }

  del (key) {
    this._db
      .transaction([this.table], 'readwrite')
      .objectStore(this.table)
      .delete(key)
  }

  _get (key, cb) {
    if (!this._db) {
      return setTimeout(() => {
        return this._get(key, cb)
      }, 100)
    }
    this._db
      .transaction(this.table)
      .objectStore(this.table)
      .get(key)
      .onsuccess = event => {
        return cb(event.target.result)
      }
  }

  async get (key) {
    return new Promise(resolve => {
      this._get(key, result => {
        resolve(result)
      })
    })
  }
}

export default Database

/* globals Vue localStorage io window */

document.addEventListener('DOMContentLoaded', function () {
  Vue.config.keyCodes = {
    'arrow-keys': [38, 40]
  }
  const vue = new Vue({
    el: '#app',
    data: {
      message: '',
      socket: io(),
      // messages: [...new Array(50)].map((i, k) => `${k} Zero: TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest`),
      messages: [],
      history: [],
      historyKey: 0,
      username: null,
      localStorage: JSON.parse(localStorage.data || '{}'),
      volume: 100,
      player: {},
      isPlaying: false,
      status: '',
      statusTimer: null,
      loginUserName: null,
      tmpImg: null,
      images: [],
      displayImage: null
    },
    computed: {
      vol () {
        const volume = this.volume / 100
        this.player.volume = volume
        return volume
      }
    },
    methods: {
      submit () {
        const message = this.message.trim()
        if (message === '') return
        this.socket.emit(
          'chat message',
          JSON.stringify({
            username: this.username,
            message: this.message
          })
        )
        this.history.unshift(this.message)
        this.historyKey = -1
        this.message = ''
      },
      clearChat () {
        delete this.localStorage.pastMsgs
        this.messages = []
        this.saveData()
      },
      logout () {
        delete this.localStorage.username
        delete this.localStorage.token
        this.oldUsername = this.username
        this.username = null
        this.saveData()
      },
      playPause () {
        if (this.isPlaying) {
          this.isPlaying = false
          this.player.pause()
          return
        }
        this.isPlaying = true
        this.player.play()
      },
      mute () {
        this.volume = parseInt(this.volume, 10) === 0 ? 100 : 0
      },
      saveData () {
        localStorage.data = JSON.stringify(this.localStorage)
      },
      setUsername () {
        const prev = this.oldUsername
        this.username = this.loginUserName.trim()
        if (this.username === '') {
          this.username = null
          return
        }
        this.localStorage.username = this.username
        this.saveData()
        this.socket.emit('userNameChange', JSON.stringify({
          prev, current: this.username
        }))
      },
      async getStatus () {
        if (this.statusTimer) clearTimeout(this.statusTimer)
        const response = await fetch('/status')
        const json = await response.json()
        this.status = json.status
        this.statusTimer = setTimeout(() => {
          this.getStatus()
        }, 5000);
      },
      navigateHistory (evt) {
        this.historyKey = evt.keyCode === 38
          ? this.historyKey += 1
          : this.historyKey -= 1
        if (this.historyKey < -1) this.historyKey = -1
        if (this.historyKey > this.history.length -1)
          this.historyKey = this.history.length -1
        this.message = this.history[this.historyKey]
      },
      pasting (evt) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items
        for (index in items) {
          var item = items[index]
          if (item.kind === 'file') {
            var blob = item.getAsFile()
            var reader = new FileReader()
            reader.onload = event => {
              this.tmpImg = event.target.result
            }
            reader.readAsDataURL(blob)
          }
        }
      },
      sendImg () {
        this.socket.emit(
          'chat message',
          JSON.stringify({
            username: '!blobImg!',
            message: this.tmpImg
          })
        )
        this.tmpImg = null
      }
    },
    mounted () {
      this.getStatus()
      this.player = this.$refs.elPlayer
      const { username, pastMsgs, token } = this.localStorage
      if (pastMsgs) this.messages = pastMsgs
      if (username) {
        this.username = username
        this.socket.emit('userNameChange', JSON.stringify({
          current: this.username,
          token
        }))
      }
      this.socket.on('chat message', msg => {
        const { username, message } = JSON.parse(msg)
        if (username === '!blobImg!') {
          this.images.unshift(message)
          this.messages.unshift({
            username: 'SYSTEM',
            message: 'Nueva imagen compartida ------------------------>'
          })
          return
        }
        this.messages.unshift({username, message})
        this.localStorage.pastMsgs = this.messages
        localStorage.data = JSON.stringify(this.localStorage)
      })
      this.socket.on('system message', msg => {
        const { key, value } = JSON.parse(msg)
        this.localStorage[key] = value
        this.saveData()
      })
    }
  })
  return vue
})

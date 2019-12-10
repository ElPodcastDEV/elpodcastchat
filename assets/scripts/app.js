/* globals Vue localStorage io window */

document.addEventListener('DOMContentLoaded', function () {
  const vue = new Vue({
    el: '#app',
    data: {
      message: '',
      socket: io(),
      // messages: [...new Array(50)].map((i, k) => `${k} Zero: TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest`),
      messages: [],
      username: null,
      localStorage: JSON.parse(localStorage.data || '{}'),
      volume: 100,
      player: {},
      isPlaying: false,
      status: '',
      statusTimer: null,
      loginUserName: null
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
        this.socket.emit(
          'chat message',
          JSON.stringify({
            username: this.username,
            message: this.message
          })
        )
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
        this.username = this.loginUserName
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
        this.messages.unshift(`${username}: ${message}`)
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

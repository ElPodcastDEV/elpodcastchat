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
      nickname: '',
      localStorage: JSON.parse(localStorage.data || '{}'),
      volume: 100,
      player: {},
      isPlaying: false
    },
    computed: {
      vol () {
        const volume = this.volume / 100
        this.player.volume = volume
        return volume
      }
    },
    methods: {
      setName () {
        this.username = this.nickname
        this.localStorage.username = this.username
        localStorage.data = JSON.stringify(this.localStorage)
      },
      submit () {
        this.socket.emit('chat message', `${this.username}: ${this.message}`)
        this.message = ''
      },
      clearChat () {
        delete this.localStorage.pastMsgs
        localStorage.data = JSON.stringify(this.localStorage)
        window.location.href = (() => window.location.href)()
      },
      logout () {
        delete this.localStorage.username
        localStorage.data = JSON.stringify(this.localStorage)
        window.location.href = (() => window.location.href)()
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
      }
    },
    mounted () {
      this.player = this.$refs.elPlayer
      const { username, pastMsgs } = this.localStorage
      if (username) this.username = username
      if (pastMsgs) this.messages = pastMsgs
      this.socket.on('chat message', msg => {
        this.messages.unshift(msg)
        this.localStorage.pastMsgs = this.messages
        localStorage.data = JSON.stringify(this.localStorage)
      })
    }
  })
  return vue
})

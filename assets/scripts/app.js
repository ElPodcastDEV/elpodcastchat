/* globals Vue localStorage io fetch FileReader */

document.addEventListener('DOMContentLoaded', function () {
  Vue.config.keyCodes = {
    'arrow-keys': [38, 40]
  }
  const vue = new Vue({
    el: '#app',
    data: {
      message: '',
      socket: io(),
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
      displayImage: null,
      reloadMe: true
    },
    computed: {
      vol () {
        const volume = this.volume / 100
        this.player.volume = volume
        return volume
      },
      chatMessages () {
        return this.messages.filter(msg => {
          if (!msg.uid) return false
          const epoch = msg.uid.split('-')[0]
          const now = new Date().getTime()
          const msgTimeStamp = new Date(parseInt(epoch, 10)).getTime()
          return msgTimeStamp + 8.64e7 > now
        })
      }
    },
    methods: {
      submit () {
        const message = this.message.trim()
        if (message === '') return
        if (message === '/pip') return this.requestImage()
        const { token } = this.localStorage
        this.sendMessage({
          username: this.username,
          message: this.message,
          token
        })
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
      sendMessage (params) {
        this.socket.emit('chat message', JSON.stringify(params))
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
        this.sendMessage({
          messageType: 'userNameChange',
          current: this.username,
          prev
        })
        setTimeout(() => { this.toText() }, 1)
      },
      async getStatus () {
        if (this.statusTimer) clearTimeout(this.statusTimer)
        const response = await fetch('/status')
        const json = await response.json()
        this.status = json.status
        this.statusTimer = setTimeout(() => {
          this.getStatus()
        }, 5000)
      },
      navigateHistory (evt) {
        this.historyKey = evt.keyCode === 38
          ? this.historyKey += 1
          : this.historyKey -= 1
        if (this.historyKey < -1) this.historyKey = -1
        if (this.historyKey > this.history.length - 1) {
          this.historyKey = this.history.length - 1
        }
        this.message = this.history[this.historyKey]
      },
      requestImage () {
        this.message = ''
        this.$refs.fileSelector.click()
      },
      fileSelected (event) {
        const file = event.target.files[0]
        if (!file.type.match('image.*')) return
        var reader = new FileReader()
        reader.onload = event => {
          this.tmpImg = event.target.result
          this.reloadMe = false
          this.$nextTick(() => { this.reloadMe = true })
        }
        reader.readAsDataURL(file)
      },
      pasting (event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items
        for (var index in items) {
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
        const { token } = this.localStorage
        this.sendMessage({
          messageType: 'sendImage',
          username: this.username,
          message: this.tmpImg,
          token
        })
        this.tmpImg = null
      },
      toText () {
        this.$refs.textInput.focus()
      },
      deleteMessage (msgId) {
        this.messages = this.messages.filter(m => m.uid !== msgId)
        this.localStorage.pastMsgs = this.messages
        this.saveData()
      },
      clearMessage (msgId) {
        this.deleteMessage(msgId)
        const { token } = this.localStorage
        this.sendMessage({
          messageType: 'deleteMessage',
          msgId,
          token
        })
      }
    },
    mounted () {
      this.getStatus()
      this.player = this.$refs.elPlayer
      const { username, pastMsgs, token } = this.localStorage
      if (pastMsgs) this.messages = pastMsgs
      if (username) {
        this.username = username
        this.sendMessage({
          messageType: 'userNameChange',
          current: this.username,
          token
        })
      }
      this.socket.on('chat message', msg => {
        const { messageType, username, message, uid, msgId } = JSON.parse(msg)
        if (messageType === 'sendImage') {
          this.images.unshift({ blob: message, uid })
          return
        }
        if (messageType === 'deleteMessage') {
          this.deleteMessage(msgId)
          return
        }
        this.messages.unshift({ username, message, uid })
        this.localStorage.pastMsgs = this.messages
        this.saveData()
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

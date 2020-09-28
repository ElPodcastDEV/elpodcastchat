<style lang="sass" scoped>
.elform
  padding: 0 5px
  display: flex
  align-items: center
  height: 20px
  line-height: 20px
  .prompt
    height: 15px
    line-height: 18px
    white-space: nowrap
    .username
      color: var(--teal)
      font-weight: 800
    .home
      color: var(--home)
    .par
      color: var(--pare)
    .branch
      color: var(--bran)
  input
    border: 0
    padding: 0 0 0 5px
    flex-grow: 1
    background-color: transparent
    color: var(--red)
    text-shadow: 0px 0px 0px var(--foreground)
    -webkit-text-fill-color: transparent
</style>
<template lang="pug">
  form.elform(@submit.prevent='submit')
    template(v-if='userName')
      label(for="prompt").prompt
        span.home {{userName}}
        span.username @epd&nbsp;
        span.branch
          span.par (
          |{{ep}}
          span.par )
      input(
        ref='fileSelector'
        type='file'
        @change='fileSelected'
        v-show='false'
        v-if='reloadMe'
      )
      input(
        id="prompt"
        autocomplete='off'
        v-model='message'
        @keyup.arrow-keys='navigateHistory'
        @paste='pasting'
        ref='textInput'
        :is-focus='isFocus'
        spellcheck='false'
      )
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'

export default {
  data: () => ({
    imageToVIP: false,
    message: '',
    history: [],
    historyKey: 0,
    reloadMe: true
  }),
  computed: {
    ep () {
      return brain.get('episode') || 'master'
    },
    isFocus () {
      if (brain.get('focusText')) {
        this.$refs.textInput.focus()
        brain.set({ focusText: false })
      }
      return true
    },
    userName () {
      const userName = brain.get('userName')
      if (!userName) return ''
      if (userName.length > 8) {
        return userName.slice(0, 8)
      }
      return userName
    }
  },
  methods: {
    pasting (event) {
      const items = (
        event.clipboardData || event.originalEvent.clipboardData
      ).items
      for (var index in items) {
        const item = items[index]
        if (item.kind === 'file') {
          const blob = item.getAsFile()
          const reader = new FileReader()
          reader.onload = event => {
            brain.set({ tmpImg: event.target.result })
          }
          reader.readAsDataURL(blob)
        }
      }
    },
    toggleVIP (value) {
      this.message = ''
      this.imageToVIP = value
      brain.set({
        imageToVIP: this.imageToVIP
      })
      if (value) brain.systemLocal('you are super user')
      else brain.systemLocal('you are mortal')
    },
    requestImage (vip = false) {
      this.message = ''
      if (vip) this.imageToVIP = true
      this.$refs.fileSelector.click()
    },
    resetFileSelector () {
      this.reloadMe = false
      this.imageToVIP = false
      this.$nextTick(() => { this.reloadMe = true })
    },
    fileSelected (event) {
      const file = event.target.files[0]
      if (!file.type.match('image.*')) return this.resetFileSelector()
      var reader = new FileReader()
      reader.onload = event => {
        brain.set({
          tmpImg: event.target.result,
          imageToVIP: this.imageToVIP
        })
        this.resetFileSelector()
      }
      reader.readAsDataURL(file)
    },
    clearChat () {
      this.message = ''
      brain.set({ messages: [] })
    },
    logout () {
      sendMessage({
        messageType: 'logout',
        current: brain.get('userName')
      })
      brain.set({
        oldUsername: null,
        userName: null,
        token: null
      })
      document.location.href = (() => document.location.href)()
    },
    async gif (message) {
      const [, url] = message.split('/gif ')
      if (url) {
        this.message = ''
        return brain.set({ tmpImg: url })
      }
      brain.systemLocal('Usage: /gif <url/to/image.gif>')
    },
    submit () {
      const message = this.message.trim()
      if (message === '') return
      if (message === '/img') return this.requestImage()
      if (message === '/sudo') return this.toggleVIP(true)
      if (message === '/exit') return this.toggleVIP(false)
      if (message === '/pip') return this.requestImage(true)
      if (message === '/clear') return this.clearChat()
      if (message === '/logout') return this.logout()
      if (message.slice(0, 4) === '/gif') {
        return this.gif(message)
      }
      const token = brain.get('token')
      sendMessage({
        username: brain.get('userName'),
        message: this.message,
        token
      })
      this.history.unshift(this.message)
      this.historyKey = -1
      this.message = ''
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
    }
  },
  mounted () {
    this.$root.$on('addToMsg', userName => {
      this.message = (this.message === '')
        ? `@${userName} `
        : this.message + ` @${userName} `
    })
  }
}
</script>

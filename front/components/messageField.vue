<style lang="sass" scoped>
.elform
  padding: 10px
  display: flex
  grid-area: form
  align-items: center
  span
    cursor: pointer
  input
    border: 0
    padding: 10px
    flex-grow: 1
    margin-right: 10px
  button
    border: none
    padding: 10px
    background-color: var(--bgdarker)
    color: var(--foreground)
</style>
<template lang="pug">
  form.elform(@submit.prevent='submit')
    template(v-if='userName')
      input(
        ref='fileSelector'
        type='file'
        @change='fileSelected'
        v-show='false'
        v-if='reloadMe'
      )
      input(
        autocomplete='off'
        v-model='message'
        :placeholder="userName + ':'"
        @keyup.arrow-keys='navigateHistory'
        @paste='pasting'
        ref='textInput'
        :is-focus='isFocus'
      )
      button Enviar
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'

export default {
  data: () => ({
    message: '',
    history: [],
    historyKey: 0,
    reloadMe: true
  }),
  computed: {
    isFocus () {
      if (brain.get('focusText')) {
        this.$refs.textInput.focus()
        brain.set({ focusText: false })
      }
      return true
    },
    userName () {
      return brain.get('userName')
    }
  },
  methods: {
    pasting (event) {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items
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
    requestImage () {
      this.message = ''
      this.$refs.fileSelector.click()
    },
    resetFileSelector () {
      this.reloadMe = false
      this.$nextTick(() => { this.reloadMe = true })
    },
    fileSelected (event) {
      const file = event.target.files[0]
      if (!file.type.match('image.*')) return this.resetFileSelector()
      var reader = new FileReader()
      reader.onload = event => {
        brain.set({ tmpImg: event.target.result })
        this.resetFileSelector()
      }
      reader.readAsDataURL(file)
    },
    submit () {
      const message = this.message.trim()
      if (message === '') return
      if (message === '/pip') return this.requestImage()
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
    },
  }
}
</script>

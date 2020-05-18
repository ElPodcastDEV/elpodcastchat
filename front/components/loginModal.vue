<style lang="sass" scoped>
form input
  border: 0
  padding: 10px
  flex-grow: 1
  margin-right: 10px
form button
  border: none
  padding: 10px
  background-color: var(--bgdarker)
  color: var(--foreground)
</style>
<template lang="pug">
  modal(:display="!userName")
    form.loginWindow(@submit.prevent='setUsername')
      | Por favor indica tu nombre de usuario
      div
        input(
          v-model='loginUserName'
          autofocus
        )
        button Entrar
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'
import modal from 'Components/modal.vue'
export default {
  data: () => ({
    loginUserName: null
  }),
  computed: {
    userName () {
      return brain.get('userName')
    }
  },
  methods: {
    setUsername () {
      const prev = brain.get('oldUsername')
      const userName = this.loginUserName.trim()
      if (userName === '') return
      brain.set({ userName })
      sendMessage({
        messageType: 'userNameChange',
        current: userName,
        prev
      })
      this.$nextTick(() => {
        brain.set({ focusText: true })
      })
    }
  },
  components: {
    modal
  }
}
</script>

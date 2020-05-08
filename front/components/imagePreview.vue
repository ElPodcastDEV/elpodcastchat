<style lang="sass" scoped>
.sendImg
  position: absolute
  bottom: 70px
  left: 20px
.sendImg img
  width: 200px
  height: 200px
  object-fit: contain
  border: none
  border-radius: 4px
  background-color: var(--bgdarker)
  border: 1px solid var(--foreground)
  cursor: pointer
.sendImg .btns
  display: flex
  justify-content: space-between
  margin-top: 10px
.sendImg .btn
  width: 40%
  color: var(--foreground)
  background-color: var(--bgdarker)
  font-size: 0.8em
  padding: 10px 0
  border-radius: 4px
  border: 1px solid var(--foreground)
  text-align: center
  cursor: pointer
  transition: background-color 500ms linear
.sendImg .btn:hover
  background-color: var(--background)
.sendImg .btn.send
  background-color: var(--background)
.sendImg .btn.send:hover
  background-color: var(--bgdarker)
</style>
<template lang="pug">
  .imagesPreview
    .sendImg(v-if='tmpImg')
      img(:src='tmpImg')
      .btns
        .btn.send(@click='sendImg') Enviar
        .btn.cancel(@click='discardImage') Cancelar
    modal(:display="displayImage" :action='discardImage')
      img.loginWindow(:src='displayImage')
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'
import modal from 'Components/modal.vue'
export default {
  computed: {
    tmpImg () {
      return brain.get('tmpImg')
    },
    displayImage () {
      return brain.get('displayImage')
    }
  },
  methods: {
    discardImage () {
      brain.set({
        displayImage: null,
        tmpImg: null,
        focusText: true
      })
    },
    sendImg () {
      const token = brain.get('token')
      const isVIP = brain.get('imageToVIP') ? 'VIP' : ''
      sendMessage({
        messageType: `sendImage${isVIP}`,
        username: brain.get('userName'),
        message: this.tmpImg,
        token
      })
      this.discardImage()
    }
  },
  components: {
    modal
  }
}
</script>

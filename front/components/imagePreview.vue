<style lang="sass" scoped>
.sendImg
  position: absolute
  bottom: 70px
  left: 20px
.sendImg img, .imagesHistory img
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

.imagesHistory
  position: absolute
  bottom: 55px
  top: 70px
  left: 5px
  display: flex
  flex-direction: column-reverse
  overflow: auto
.imagesHistory img
  width: 10px
  height: 100px
  margin-top: 5px
.imagesHistory img:hover
  width: 100px
.imagesHistory img.seen
  border: 1px solid transparent
</style>
<template lang="pug">
  .imagesPreview
    .sendImg(v-if='tmpImg')
      img(:src='tmpImg')
      .btns
        .btn.send(@click='sendImg') Enviar
        .btn.cancel(@click='discardImage') Cancelar
    .imagesHistory
      img(
        :class='image.seen ? "seen" : ""'
        :src='image.blob'
        :key='image.uid'
        v-for='image in images'
        @click='image.seen = true; displayImage = image.blob'
      )
    modal(:display="displayImage" :action='discardImage')
      img.loginWindow(:src='displayImage')
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'
import modal from 'Components/modal.vue'
export default {
  data: () => ({
    displayImage: null
  }),
  computed: {
    tmpImg () {
      return brain.get('tmpImg')
    },
    images () {
      return brain.get('images')
    }
  },
  methods: {
    discardImage () {
      this.displayImage = null
      brain.set({
        tmpImg: null,
        focusText: true
      })
    },
    sendImg () {
      const token = brain.get('token')
      sendMessage({
        messageType: 'sendImage',
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

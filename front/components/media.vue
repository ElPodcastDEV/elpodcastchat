<style lang="sass" scoped>
.embed
  grid-area: display
  width: 90%
  height: 90%
  margin: 5%
  border: none
  display: flex
  align-items: center
  justify-content: center
  img
    max-width: 100%
    max-height: 100%
    object-fit: contain
</style>
<template lang="pug">
  .embed
    template(v-if="src")
      img(:src="src", @click="makeItBigger")
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'
export default ({
  data: () => ({
    countDowntoSeed: null
  }),
  computed: {
    src () {
      return brain.get('showcaseImage')
    }
  },
  methods: {
    lookForShowcase () {
      if (this.countDownToSeed) clearTimeout(this.countDownToSeed)
      this.countDownToSeed = setTimeout(() => {
        this.lookForShowcase()
      }, 6e4)
      brain.lookForShowcase().then(blob => {
        if (blob === null) return
        const token = brain.get('token')
        const isVIP = brain.get('imageToVIP') ? 'VIP' : ''
        if (isVIP !== 'VIP' || !token) return
        sendMessage({
          messageType: `sendImage${isVIP}`,
          username: brain.get('userName'),
          message: blob,
          token
        })
      })
    },
    makeItBigger () {
      brain.setImage(this.src)
    }
  },
  mounted () {
    this.lookForShowcase()
  }
})
</script>

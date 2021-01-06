<style lang="sass" scoped>
.jingle
  position: relative
  width: 100px
  height: 100px
  border-radius: 10px
  overflow: hidden
  margin: 4px
  cursor: pointer
  img
    position: absolute
    width: 100%
    height: 100%
    object-fit: cover
  .name
    position: absolute
    width: 100%
    bottom: 10px
    text-align: center
    padding: 4px
    background-color: var(--bgdarker)
  .glare
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    opacity: 0.5
    box-shadow: inset 10px 10px 7px -10px var(--white), inset -10px -10px 7px -10px var(--white)
</style>
<template lang="pug">
.jingle(
  @click="playStop"
  @contextmenu.prevent="$emit('mutate', id)"
)
  img(:src="imageSrc")
  .name {{name}}
  audio(ref="player" :src="file")
  .glare
</template>
<script>
export default {
  data: () => ({
    isPlaying: false
  }),
  methods: {
    playStop () {
      if (this.isPlaying) return this.stop()
      this.audio.play().then(_ => { this.isPlaying = true })
    },
    stop () {
      this.audio.pause()
      this.isPlaying = false
      this.audio.currentTime = 0
    },
    handleEnded () {
      this.isPlaying = false
    }
  },
  watch: {
    volume (current) {
      if (this.audio) this.audio.volume = current / 100
    }
  },
  computed: {
    imageSrc () {
      return this.image || 'https://assets.stickpng.com/images/5895d315cba9841eabab607e.png'
    }
  },
  mounted () {
    this.audio = this.$refs.player
    this.audio.volume = this.volume / 100
    this.audio.addEventListener('ended', this.handleEnded)
  },
  beforeDestroy () {
    this.audio.removeEventListener('ended', this.handleEnded)
  },
  props: {
    file: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    volume: {
      type: String
    },
    id: {
      type: String
    }
  }
}
</script>

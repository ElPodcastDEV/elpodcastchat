<style lang="sass" scoped>
.audio
  width: 100%
  .player
    display: flex
    align-items: center
    justify-content: left
    i
      cursor: pointer
      font-size: 49px
      margin-top: 5px
  .range
    position: relative
    width: 100px

    input
      position: absolute
      top: 0
      left: 0
  audio
    display: none

/* shameless range css copy/pasted */
input[type='range'].background
  overflow: hidden
input[type='range']
  -webkit-appearance: none
  width: 100%
  background-color: rgba(255,255,255,0.1)
input[type='range']::-webkit-slider-runnable-track
  -webkit-appearance: none
  height: 4px
input[type='range'].background::-webkit-slider-thumb
  -webkit-appearance: none
  width: 15px
  height: 15px
  background: transparent
  box-shadow: -80px 0 0 80px #ffffff
input[type='range']::-webkit-slider-thumb
  -webkit-appearance: none
  width: 15px
  height: 15px
  border-radius: 15px
  margin-top: -6px
  background: #000
  border: 3px solid #eee

input[type="range"]::-moz-range-progress
  background-color: #ffffff

input[type="range"]::-moz-range-track
  background-color: rgba(255,255,255,0.1)

input[type="range"]::-ms-fill-lower
  background-color: #ffffff

input[type="range"]::-ms-fill-upper
  background-color: rgba(255,255,255,0.1)

</style>
<template lang="pug">
  .audio
    .player
      tooltip.top(v-show='!isPlaying', text="Reproducir")
        i.material-icons(@click='playPause') play_arrow

      tooltip.top(v-show='isPlaying', text="Pausa")
        i.material-icons(@click='playPause') pause

      div.range
        input(type='range' min='0' max='100' v-model='volume').background
        input(type='range' min='0' max='100' v-model='volume').foreground

      audio(controls='' ref='elPlayer')
        source(src='https://listen.elpodcast.dev' type='audio/mp3')
        | Your browser does not support the audio tag. {{vol}}
</template>
<script>
import tooltip from 'Components/tooltip.vue'
export default {
  data: () => ({
    isPlaying: false,
    player: {},
    volume: 50
  }),
  computed: {
    vol () {
      const volume = this.volume / 100
      this.player.volume = volume // eslint-disable-line
      return volume
    }
  },
  methods: {
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
  },
  components: {
    tooltip
  }
}
</script>

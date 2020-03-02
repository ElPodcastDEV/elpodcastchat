<style lang="sass" scoped>
.audio
  display: flex
  flex-direction: column
  align-items: center

  .player
    display: flex
    align-items: center
    margin-bottom: 5px
    i
      cursor: pointer

  .status
    font-size: 0.8em
    text-align: center
    opacity: 0.7
    &, a
      color: var(--foreground)
    &:hover
      opacity: 1

  audio
    display: none

/* shameless range css copy/pasted */
input[type=range] 
  -webkit-appearance: none
  margin: 0 10px
  width: 100px
  cursor: pointer
  --thumbWidth: 16px
  --thumbHeight: 30px
  --trackHeight: 8px
input[type=range]::-webkit-slider-runnable-track 
  width: 100%
  height: 8px
  background: var(--background)
input[type=range]::-webkit-slider-thumb 
  box-shadow: 1px 1px 1px var(--bgdarker), 0px 0px 1px var(--bgdarker)
  border: 1px solid var(--bgdarker)
  width: var(--thumbWidth)
  height: var(--thumbHeight)
  border-radius: 3px
  background: var(--background)
  -webkit-appearance: none
  margin-top: calc( -1 * calc(var(--thumbHeight) - calc(var(--thumbHeight) / 1.6)))
  transition: background-color 500ms linear
input[type=range]:hover::-webkit-slider-thumb 
  background: var(--foreground)
input[type=range]::-moz-range-track 
  width: 100%
  height: --trackHeight
  background: var(--background)
input[type=range]::-moz-range-thumb 
  box-shadow: 1px 1px 1px var(--bgdarker), 0px 0px 1px var(--bgdarker)
  border: 1px solid var(--bgdarker)
  width: var(--thumbWidth)
  height: var(--thumbHeight)
  border-radius: 3px
  background: var(--foreground)
input[type=range]::-ms-track 
  width: 100%
  height: --trackHeight
  background: transparent
  border-color: transparent
  border-width: 16px 0
  color: transparent
input[type=range]::-ms-fill-lower 
  background: var(--background)
  border: 0.2px solid var(--bgdarker)
  border-radius: 2.6px
  box-shadow: 1px 1px 1px var(--bgdarker), 0px 0px 1px var(--bgdarker)
input[type=range]::-ms-fill-upper 
  background: var(--background)
  border: 0.2px solid var(--bgdarker)
  border-radius: 2.6px
  box-shadow: 1px 1px 1px var(--bgdarker), 0px 0px 1px var(--bgdarker)
input[type=range]::-ms-thumb 
  box-shadow: 1px 1px 1px var(--bgdarker), 0px 0px 1px var(--bgdarker)
  border: 1px solid var(--bgdarker)
  width: var(--thumbWidth)
  height: var(--thumbHeight)
  border-radius: 3px
  background: var(--foreground)
input[type=range]:focus::-ms-fill-lower 
  background: var(--background)
input[type=range]:focus::-ms-fill-upper 
  background: var(--background)


</style>
<template lang="pug">
  .audio
    .player
      tooltip.bottom(v-show='!isPlaying', text="Reproducir")
        i.material-icons(@click='playPause') play_arrow
      
      tooltip.bottom(v-show='isPlaying', text="Pausa")
        i.material-icons(@click='playPause') pause

      input(type='range' min='0' max='100' v-model='volume')

      tooltip.bottom(v-show='parseInt(volume, 10)!==0', text="Silenciar")
        i.material-icons(@click='mute') volume_up

      tooltip.bottom(v-show='parseInt(volume, 10)===0', text="Activar Volumen")
        i.material-icons(@click='mute') volume_off

      audio(controls='' ref='elPlayer')
        source(src='https://listen.elpodcast.dev' type='audio/mp3')
        | Your browser does not support the audio tag. {{vol}}
    span.status
      |Escúchanos en&nbsp;
      a(href="https://listen.elpodcast.dev", target="blank") https://listen.elpodcast.dev
</template>
<script>
import tooltip from 'Components/tooltip.vue'
export default {
  data: () => ({
    isPlaying: false,
    player: {},
    volume: 100,
  }),
  computed: {
    vol () {
      const volume = this.volume / 100
      this.player.volume = volume
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

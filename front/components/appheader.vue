<style lang="sass" scoped>
.header
  display: flex
  flex-direction: column
  padding: 10px
  background-color: var(--bgdarker)
  color: var(--foreground)
  grid-area: header

  .branding
    width: 100%
    display: flex
    align-items: center
    margin-bottom: 5px

  img
    height: 50px
    margin-right: 5px

  i:hover
    cursor: pointer
    color: var(--background)

</style>
<template lang="pug">
  header.header
    //- span.branding
      img(src='/epdlogo.png')
      player
    interests

</template>
<script>
import brain from 'Utils/brain'
// import player from 'Components/player.vue'
import interests from 'Components/interests.vue'
import tooltip from 'Components/tooltip.vue'
export default {
  computed: {
    userName () {
      return brain.get('userName')
    }
  },
  methods: {
    clearChat () {
      brain.set({ messages: [] })
    },
    logout () {
      brain.set({
        oldUsername: this.username,
        userName: null,
        token: null
      })
    }
  },
  components: {
    // player,
    tooltip,
    interests
  }
}
</script>

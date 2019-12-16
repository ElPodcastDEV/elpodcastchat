<style lang="sass" scoped>
.header
  display: flex
  justify-content: space-between
  align-items: center
  padding: 10px
  background-color: var(--bgdarker)
  box-shadow: 0 0 10px 0 var(--bgdarker)
  color: var(--background)
  grid-area: header

  .branding
    display: flex
    align-items: center

  img
    height: 50px
    margin-right: 5px

  i:hover
    cursor: pointer
    color: var(--foreground)

  .opts
    white-space: nowrap

</style>
<template lang="pug">
  header.header
    span.branding
      img(src='https://cdn.simplecast.com/images/20122399-3919-4089-b540-10f66a258c04/8734f16b-187a-41cb-9a6f-34ff0f2ee6c5/640x640/1551986909artwork.jpg')
    player
    .opts: template(v-if="!isReplaying")
      tooltip.left-bottom(text="Cambiar Nombre" v-show='userName')
        i.material-icons(@click='logout') exit_to_app
      tooltip.left-bottom(text="Borrar Chat")
        i.material-icons(@click='clearChat') clear
</template>
<script>
import brain from 'Utils/brain'
import player from 'Components/player.vue'
import tooltip from 'Components/tooltip.vue'
export default {
  computed: {
    userName () {
      return brain.get('userName')
    },
    isReplaying () {
      console.log(brain.get('episode'))
      return brain.get('episode')
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
    },
  },
  components: {
    player,
    tooltip
  }
}
</script>

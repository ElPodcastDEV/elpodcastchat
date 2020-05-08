<style lang="sass" scoped>
.modal, .modal .background
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
.modal
  display: flex
  justify-content: center
  align-items: center
  .background
    background-color: var(--bgdarker)
    opacity: 0.8
  .loginWindow
    position: relative
    max-width: 90%
    max-height: 90%
  img
    box-shadow: 0 0 10px 0 var(--bgdarker)
  .loginWindow div
    display: flex
    margin-top: 10px
</style>
<template lang="pug">
  .modal(v-if='display' @click="handleOnClick")
    .background
    slot
</template>
<script>
export default {
  methods: {
    handleOnClick () {
      this.action()
    }
  },
  props: {
    display: {
      default: false,
    },
    action: {
      default: () => () => {}
    }
  }
}
</script>

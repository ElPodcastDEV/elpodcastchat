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
</style>
<template lang="pug">
  .modal(v-show='display' @click="handleOnClick")
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
      default: false
    },
    action: {
      default: () => () => {}
    }
  }
}
</script>

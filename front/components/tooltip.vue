<style lang="sass" scoped>
.toolTip
  position: relative
.toolTipText
  position: absolute
  padding: 5px 10px
  background-color: #000
  border-radius: 4px
  color: var(--foreground)
  font-size: 0.7em
  cursor: default
  opacity: 0
  z-index: -1000
  transition: opacity 100ms linear
  white-space: nowrap
.toolTip:hover .toolTipText
  opacity: 1
  z-index: 1000
.toolTip.bottom .toolTipText
  top: 100%
  left: 50%
  transform: translateX(-50%)
.toolTip.left-bottom .toolTipText
  top: 100%
  right: 0
</style>
<template lang="pug">
  span.toolTip
    slot
    span.toolTipText {{text}}
</template>
<script>
export default {
  props: {
    text: {
      default: ''
    }
  }
}
</script>

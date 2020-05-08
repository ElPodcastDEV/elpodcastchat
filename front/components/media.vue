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
  export default ({
    computed: {
      src () {
        return brain.get('showcaseImage')
      }
    },
    methods: {
      makeItBigger () {
        brain.setImage(this.src)
      }
    },
    mounted () {
      brain.lookForShowcase()
    }
  })
</script>

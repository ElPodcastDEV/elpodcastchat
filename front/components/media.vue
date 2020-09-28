<style lang="sass" scoped>
.embed
  grid-area: display
  width: 90%
  height: 90%
  margin: auto
  border: none
  display: flex
  align-items: center
  justify-content: center
  img
    max-width: 100%
    max-height: 90%
    opacity: 0.8
</style>
<template lang="pug">
  .embed
    template(v-if="src")
      iframe(
        width="100%"
        height="100%"
        :src="'https://www.youtube.com/embed/'+src+'?autoplay=1'"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      )
    template(v-else)
      img(src="https://image.simplecastcdn.com/images/53d4a887-fd21-4ef7-b720-a934c95e03b1/f1bdc6b2-9cfc-40c1-b4f5-b38e508e0cc4/640x640/white-on-black.jpg")
</template>
<script>
import brain from 'Utils/brain'
export default ({
  data: () => ({
    countDowntoSeed: null
  }),
  computed: {
    src () {
      return brain.get('stream')
    }
  }
})
</script>

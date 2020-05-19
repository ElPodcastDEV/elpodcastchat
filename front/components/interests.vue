<style lang="sass" scoped>
.interest
  display: flex
  align-items: center
  width: 100%
  height: 100%
  .hosts, .links
    width: 50%
  .hosts
    display: flex
    flex-direction: column
    justify-content: space-evenly
    height: 100%
  a
    text-decoration: none
    color: var(--foreground)
  ul, li
    list-style: none
    margin: 0
    padding: 0
  li
    margin: 10px 0

  .host
    display: flex
    align-items: center
    margin-bottom: 0
    .link
      display: block
      margin-top: 3px
      font-size: 0.8em
      opacity: 0.8
    img
      width: 40px
      height: 40px
      object-fit: cover
      border-radius: 50%
      margin-right: 10px

</style>
<template lang="pug">
.interest
  .hosts
    .host
      .avatar: img(src="https://pbs.twimg.com/profile_images/1255197922129399808/MWH5ierS_400x400.jpg")
      .details
        a(href="https://twitter.com/swanros" target="_blank") Oscar Swanros
        a(href="https://twitter.com/swanros" target="_blank").link @Swanros
    .host
      .avatar: img(src="https://pbs.twimg.com/profile_images/1221511945305632768/XAxzHh_5_400x400.jpg")
      .details
        a(href="https://twitter.com/zerodragon" target="_blank") Zero Dragon
        a(href="https://twitter.com/zerodragon" target="_blank").link @ZeroDragon
    .host(v-for="guest in guests")
      .avatar: img(:src="guest.avatar")
      .details
        a(:href="guest.link" target="_blank") {{guest.name}}
        a(:href="guest.link" target="_blank").link {{guest.handle}}

  .links
    ul
      li
        a(
          target="blank"
          href="https://listen.elpodcast.dev"
        ) Eschúchanos
      li
        a(
          target='_blank'
          href='https://elpodcast.dev'
        ) ElPodcast.DEV
      li
        a(
          target='_blank'
          href='https://twitter.com/_elpodcast'
        ) @_elpodcast
      li
        a(
          target='_blank'
          href='https://www.patreon.com/elpodcastdev'
        ) El Patreon
</template>
<script>
import brain from 'Utils/brain'
export default {
  computed: {
    guests () {
      const nGuests = brain.get('nGuests')
      const guests = JSON.parse(atob(brain.get('guests')))
      return guests
        .slice(0, nGuests)
        .map(g => {
          g.handle = 'website'
          if (g.link.includes('twitter.com')) {
            const [userHandle] = (g.link.split('/')).reverse()
            g.handle = `@${userHandle}`
          }
          return g
        })
    }
  }
}
</script>

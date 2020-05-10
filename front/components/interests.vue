<style lang="sass" scoped>
.interest
  display: flex
  align-items: center
  width: 100%
  .hosts, .links
    width: 50%
  a
    text-decoration: none
    color: var(--foreground)
  ul, li
    list-style: none
    margin: 0
    padding: 0
  li
    margin-bottom: 10px

  .host
    display: flex
    align-items: center
    margin-bottom: 10px
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
        a(href="https://twitter.com/swanros" target="_blank") Swanros
    .host
      .avatar: img(src="https://pbs.twimg.com/profile_images/1221511945305632768/XAxzHh_5_400x400.jpg")
      .details
        a(href="https://twitter.com/zerodragon" target="_blank") Zero Dragon

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

import Vue from 'vue'
import brain from 'Utils/brain'
import appheader from 'Components/appheader.vue'
import messages from 'Components/messages.vue'
import loginmodal from 'Components/loginModal.vue'
import media from 'Components/media.vue'
import imagepreview from 'Components/imagePreview.vue'

document.addEventListener('DOMContentLoaded', function () {
  Vue.config.keyCodes = {
    'arrow-keys': [38, 40]
  }
  const vue = new Vue({
    el: '#app',
    components: {
      appheader,
      messages,
      loginmodal,
      imagepreview,
      media
    },
    mounted () {
      brain.loadData()
    }
  })
  return vue
})

if (new URLSearchParams(window.location.search).get('standalone') === 'true') {
  const doDelete = () => {
    const items = [...document.querySelectorAll('video, .header, .embed')]
    if (items.length !== 3) return setTimeout(doDelete, 1000)
    items.forEach(i => i.remove())
    document.querySelector('.app').classList.add('isStandAlone')
  }
  doDelete()
}

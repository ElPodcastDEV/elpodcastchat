import Vue from 'vue'
import brain from 'Utils/brain'
import appheader from 'Components/appheader.vue'
import messages from 'Components/messages.vue'
import loginmodal from 'Components/loginModal.vue'
import media from 'Components/media.vue'
import imagepreview from 'Components/imagePreview.vue'

const urlParams = new URLSearchParams(window.location.search)
const episode = urlParams.get('episode')

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
      brain.set({ episode })
    }
  })
  return vue
})

import Vue from 'vue'
import brain from 'Utils/brain'
import appheader from 'Components/appheader.vue'
import messages from 'Components/messages.vue'
import loginmodal from 'Components/loginModal.vue'
import media from 'Components/media.vue'
import imagepreview from 'Components/imagePreview.vue'
import soundpanel from 'Components/soundPanel.vue'

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
      media,
      soundpanel
    },
    mounted () {
      brain.loadData()
      tryClearInterfase()
    }
  })
  return vue
})

const queryParams = new URLSearchParams(window.location.search)
const tryClearInterfase = () => {
  if (queryParams.get('standalone') === 'true') {
    const toDelete = ['video', '.header', '.embed']
    if (queryParams.get('nologin') === 'true') toDelete.push('.modal')
    const items = [...document.querySelectorAll(toDelete.join(', '))]
    items.forEach(i => i.remove())
    document.querySelector('.app').classList.add('isStandAlone')
  }
}

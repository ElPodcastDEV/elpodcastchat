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

const queryParams = new URLSearchParams(window.location.search)
if (queryParams.get('standalone') === 'true') {
  const doDelete = () => {
    const toDelete = ['video', '.header', '.embed']
    if (queryParams.get('nologin') === 'true') toDelete.push('.modal')
    const items = [...document.querySelectorAll(toDelete.join(', '))]
    if (items.length !== toDelete.length) return setTimeout(doDelete, 1000)
    items.forEach(i => i.remove())
    document.querySelector('.app').classList.add('isStandAlone')
  }
  doDelete()
}

import Vue from 'vue'
import brain from 'Utils/brain'
import appheader from 'Components/appheader.vue'
import interests from 'Components/interests.vue'
import messages from 'Components/messages.vue'
import loginmodal from 'Components/loginModal.vue'
import messagefield from 'Components/messageField.vue'
import imagepreview from 'Components/imagePreview.vue'

document.addEventListener('DOMContentLoaded', function () {
  Vue.config.keyCodes = {
    'arrow-keys': [38, 40]
  }
  const vue = new Vue({
    el: '#app',
    components: {
      appheader,
      interests,
      messages,
      messagefield,
      loginmodal,
      imagepreview
    },
    mounted () {
      brain.loadData()
    }
  })
  return vue
})

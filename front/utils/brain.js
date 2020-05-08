import Vue from 'vue'
import { sendMessage } from 'Utils/comms'
import Database from 'Utils/indexedDB'

const database = new Database('images')

const storage = Vue.observable({
  messages: [],
  userName: null,
  token: null,
  oldUserName: null,
  focusText: false,
  tmpImg: null,
  displayImage: null,
  showcaseImage: null,
  episode: null,
  images: []
})

const brain = {
  get (key) {
    return storage[key]
  },

  set (stateObj) {
    Object.keys(stateObj).forEach(key => {
      let item = stateObj[key]
      if (typeof item === 'object') item = JSON.parse(JSON.stringify(item))
      storage[key] = item
    })
    this.saveData()
  },

  setImage (blob) {
    storage.displayImage = blob
  },

  setShowcase (blob) {
    storage.showcaseImage = blob
    database.set('showcase', blob)
  },

  lookForShowcase() {
    database.get('showcase').then(blob => {
      if (blob) storage.showcaseImage = blob
    })
  },

  deleteMessage (msgId) {
    storage.messages = storage.messages.filter(m => m.uid !== msgId)
    this.saveData()
  },

  saveData () {
    const noImages = JSON.parse(JSON.stringify(storage))
    const messages = noImages.messages.filter(mess => !mess.blob)
    delete noImages.images
    delete noImages.tmpImg
    noImages.messages = messages
    localStorage.data = JSON.stringify(noImages)
  },

  loadData () {
    const { userName, messages, token } = JSON.parse(localStorage.data || '{}')
    if (messages) this.set({ messages })
    if (userName) {
      this.set({ userName })
      sendMessage({
        messageType: 'userNameChange',
        current: userName,
        token
      })
    }
  }
}

export default brain

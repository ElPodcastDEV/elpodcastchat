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
  episode: 0,
  nGuests: 2,
  guests: 'W10=',
  images: []
})

const uuid = () => {
  const uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
  return `${new Date().getTime()}-${uid}`
}

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

  removeShowcase () {
    storage.showcaseImage = null
    database.del('showcase')
  },

  lookForShowcase () {
    database.get('showcase').then(blob => {
      if (blob) storage.showcaseImage = blob
    })
  },

  setupChat (data) {
    const chatData = JSON.parse(data)
    this.set(chatData)
  },

  deleteMessage (msgId) {
    storage.messages = storage.messages.filter(m => m.uid !== msgId)
    this.saveData()
  },

  systemLocal (message) {
    const nMessage = {
      username: 'SYSTEM',
      uid: uuid(),
      message
    }
    const messages = this.get('messages')
    messages.unshift(nMessage)
    this.set({ messages })
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
    const {
      userName,
      messages,
      token
    } = JSON.parse(localStorage.data || '{}')
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
window.Brain = brain
export default brain

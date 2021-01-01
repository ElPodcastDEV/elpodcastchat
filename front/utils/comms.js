/* global fetch */

import io from 'socket.io-client'
import brain from 'Utils/brain'
import Bot from 'Utils/texttospeech'
const bot = new Bot()

const socket = io()

export const sendMessage = params => {
  socket.emit('chat message', JSON.stringify(params))
}

export const getStatus = async () => {
  const response = await fetch('/status')
  return response.json()
}

const trySpeak = (user, message) => {
  const queryParams = new URLSearchParams(window.location.search)
  if (queryParams.get('speaker') !== 'true') return
  const [announcer, speaker] = JSON.parse(queryParams.get('voices') || '[{},{}]')
  const trigger = '!s '
  if (user === 'SYSTEM' || message.slice(0, trigger.length) !== trigger) return
  const msg = message.replace(trigger, '')
  const notification = new Audio('https://www.myinstants.com/media/sounds/tethys.mp3')
  notification.play()
  notification.onended = () => {
    bot.speak(`${user} dijo:`, announcer)
    bot.speak(msg, speaker)
  }
}

socket.on('chat message', msg => {
  const { messageType, username, message, uid, msgId } = JSON.parse(msg)
  if (messageType === 'sendImage') {
    const messages = brain.get('messages')
    messages.unshift({
      username,
      message: 'builtInImage',
      uid,
      blob: message
    })
    brain.set({ messages })
    return
  }
  if (messageType === 'sendImageVIP') {
    brain.setShowcase(message)
    return
  }
  if (messageType === 'deleteMessage') {
    brain.deleteMessage(msgId)
    return
  }
  const messages = brain.get('messages')
  trySpeak(username, message)
  messages.unshift({ username, message, uid })
  brain.set({ messages })
})

socket.on('system message', msg => {
  const { key, action, value } = JSON.parse(msg)
  if (key === 'chat-action') {
    if (brain[action]) {
      brain[action](value)
      return
    }
  }
  const data = {}
  data[key] = value
  brain.set(data)
})

let interval
const updater = () => {
  clearTimeout(interval)
  interval = setTimeout(() => {
    const token = brain.get('token')
    const username = brain.get('userName')
    if (!username) return updater()
    sendMessage({
      username,
      messageType: 'requestSetup',
      token
    })
    updater()
  }, 3000)
}
updater()

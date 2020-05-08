/* global fetch */

import io from 'socket.io-client'
import brain from 'Utils/brain'

const socket = io()

export const sendMessage = params => {
  socket.emit('chat message', JSON.stringify(params))
}

export const getStatus = async () => {
  const response = await fetch('/status')
  return response.json()
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
  messages.unshift({ username, message, uid })
  brain.set({ messages })
})

socket.on('system message', msg => {
  const { key, value } = JSON.parse(msg)
  const data = {}
  data[key] = value
  brain.set(data)
})

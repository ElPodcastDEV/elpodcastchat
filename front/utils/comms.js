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
    const images = brain.get('images')
    images.unshift({ blob: message, uid })
    brain.set({ images })
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

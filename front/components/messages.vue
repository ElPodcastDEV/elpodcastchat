<style lang="sass" scoped>
.messages
  max-width: 100vw
  grid-area: messages

  .messagesHolder
    padding: 10px
    display: flex
    flex-direction: column-reverse

  .message
    padding: 0 10px
    overflow: hidden
    text-overflow: ellipsis
    line-height: 1.3em
    min-height: 1.3em
    position: relative

  .message i
    position: absolute
    right: 0
    top: 4px
    font-size: 0.8em
    cursor: pointer
    display: none

  .message:hover i
    display: inline

  .message.SYSTEM
    opacity: 0.5
    font-size: 0.8em
    line-height: 1.1em
    min-height: 1.1em
    font-style: italic
    text-align: right

  .message.SYSTEM i
    display: none

.messagesHolder
  height: 100%
  overflow: auto

</style>
<template lang="pug">
  .messages
    .messagesHolder
      div(:key='itm.uid' :class="'message ' + itm.username" v-for='itm in chatMessages')
        span(v-if="itm.username !== 'SYSTEM'") {{itm.username}}: 
        | {{itm.message}}
        i.material-icons(@click='clearMessage(itm.uid)') delete_forever
</template>
<script>
import brain from 'Utils/brain'
import { sendMessage } from 'Utils/comms'
export default {
  computed: {
    chatMessages () {
      return brain.get('messages').filter(msg => {
        if (!msg.uid) return false
        const epoch = msg.uid.split('-')[0]
        const now = new Date().getTime()
        const msgTimeStamp = new Date(parseInt(epoch, 10)).getTime()
        return msgTimeStamp + 8.64e7 > now
      })
    }
  },
  methods: {
    clearMessage (msgId) {
      brain.deleteMessage(msgId)
      const token = brain.get('token')
      sendMessage({
        messageType: 'deleteMessage',
        msgId,
        token
      })
    }
  }
}
</script>

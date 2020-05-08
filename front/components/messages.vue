<style lang="sass" scoped>
.messages
  width: 100%
  grid-area: messages
  background-color: var(--bgdarker)
  .messagesHolder
    display: flex
    flex-direction: column-reverse
    height: calc(100% - 20px)
    overflow: auto
    min-height: 34px
  .message
    padding: 5px 10px
    position: relative
    display: flex
    flex-direction: column
    transition: background-color 500ms linear
  .message .userName
    font-weight: bold
    color: #68fdf7
  .message .txtData
    display: inline-block
    width: 100%
    word-break: break-all
  .message i
    position: absolute
    right: 0
    top: 4px
    font-size: 0.8em
    cursor: pointer
    display: none
  .message:hover
    background-color: var(--background)
    i
      display: inline
  .message.SYSTEM
    opacity: 0.5
    font-size: 0.8em
    font-style: italic
    padding-top: 0
    padding-bottom: 0
  .message.isMention
    background-color: var(--background)
  .message .userName
    cursor: pointer
  .message img
    border: 1px solid var(--foreground)
    max-width: 100%
    max-height: 250px
    object-fit: contain
    border-radius: 6px
</style>
<template lang="pug">
  .messages
    .messagesHolder
      div(:key='itm.uid' :class="'message ' + itm.username + ' ' + isMention(itm)" v-for='itm in chatMessages')
        span.userName(
          v-if="itm.username !== 'SYSTEM'"
          @click="addToMsg(itm.username)"
        ) {{itm.username}}
        span.txtData
          template(v-if="itm.blob")
            img(
              :src="itm.blob"
              @click='displayImage(itm.blob)'
            )
          template(v-else)
            |{{itm.message}}
        i.material-icons(@click='clearMessage(itm.uid)') delete_forever
    messagefield
</template>
<script>
import brain from 'Utils/brain'
import messagefield from 'Components/messageField.vue'
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
    },
    displayImage (blob) {
      brain.setImage(blob)
    },
    isMention(item) {
      if (item.username === 'SYSTEM') return ''
      if (item.message.indexOf(`@${brain.get('userName')}`) !== -1) return 'isMention'
      return ''
    },
    addToMsg(userName) {
      this.$root.$emit('addToMsg', userName)
      brain.set({ focusText: true })
    }
  },
  components: {
    messagefield
  }
}
</script>

<style lang="sass" scoped>
.trigger
  position: absolute
  top: 10px
  right: 10px
  opacity: 0.4
  &:hover
    opacity: 1
i
  cursor: pointer
.panelHolder
  .modal
    flex-direction: column
.soundPanel, .liveButton, .buttons
  position: relative
  display: flex
.actions
  display: flex
  flex-direction: column
.liveButton
  align-items: center
  margin-top: 10px
input
  margin-bottom: 5px
.newBtn
  text-align: center
  .jingle
    text-align: left
</style>
<template lang="pug">
  .panelHolder
    modal(:display="showPanel")
      .soundPanel
        jingle(
          v-for="jingle in jingles"
          :file="jingle.file"
          :name="jingle.name"
          :image="jingle.image"
          :volume="jingle.volume"
          :key="jingle.id"
          :id="jingle.id"
          @mutate="mutate"
        )
      .liveButton
        .newBtn
          | New / Edit
          jingle(
            :file="jg.file"
            :name="jg.name"
            :image="jg.image"
            :volume="jg.volume"
          )
        .actions
          label Name:
          input(v-model="jg.name")
          label Audio file:
          input(v-model="jg.file")
          label Image:
          input(v-model="jg.image")
          label Volume
          input(type="range" min="0" max="100" v-model="jg.volume")
          .buttons
            .btn(@click="saveJingle")
              i.material-icons save
            .btn(@click="resetValues")
              i.material-icons cancel
            .btn(@click="deleteJingle" v-if="currentJingle")
              i.material-icons delete_forever
    .trigger
      i.material-icons(@click="showPanel=!showPanel" v-if="isAdmin") volume_up
</template>
<script>
import modal from 'Components/modal.vue'
import jingle from 'Components/jingle.vue'
import brain, { uuid } from 'Utils/brain'
export default {
  data: () => ({
    showPanel: true,
    jg: {
      name: 'Button name',
      file: null,
      image: null,
      volume: '50'
    },
    currentJingle: null,
    jingles: []
  }),
  methods: {
    saveJingle () {
      const newJingle = Object.assign({ ...this.jg }, { id: this.jg.id || uuid() })
      this.jingles = this.jingles.map(j => {
        if (j.id !== newJingle.id) return j
        return Object.assign(j, newJingle)
      })
      if (!this.jingles.find(j => j.id === newJingle.id)) this.jingles.push(newJingle)
      this.resetValues()
    },
    mutate (id) {
      const selected = this.jingles.find(j => j.id === id)
      this.currentJingle = id
      this.jg = { ...selected }
    },
    deleteJingle () {
      this.jingles = this.jingles.filter(j => j.id !== this.currentJingle)
      this.resetValues()
    },
    resetValues () {
      this.jg = {
        name: 'Button name',
        file: null,
        image: null,
        volume: '50'
      }
      this.currentJingle = null
    }
  },
  computed: {
    isAdmin () {
      return brain.get('imageToVIP')
    }
  },
  components: {
    modal,
    jingle
  }
}
</script>

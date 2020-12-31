export default class Bot {
  constructor (params = {}) {
    this.params = Object.assign({
      rate: 1.05,
      pitch: 1.4,
      voiceId: 31
    }, params)
    this.messages = []
    this.bot = window.speechSynthesis
    this.bot.cancel()
  }

  speak (message, params = {}) {
    this.messages.push({ msg: message.trim().replace(/\s+/g, ' '), params })
    this.sayNextMessage()
  }

  stop () {
    this.bot.cancel()
  }

  stopAll () {
    this.messages = []
    this.stop()
  }

  sayNextMessage () {
    if (this.bot.speaking) return
    if (this.messages.length === 0) return

    const { msg, params } = this.messages.shift()
    const voiceParams = Object.assign(this.params, params)

    this.voice = new SpeechSynthesisUtterance()
    Object.keys(voiceParams).forEach(key => {
      this.voice[key] = this.params[key]
    })
    this.voice.onboundary = _event => {
      this.voice.wordCount -= 1
      if (this.voice.wordCount !== 0) return
      this.bot.cancel()
    }
    this.voice.onstart = () => {
      if (this.startedSpeaking) this.startedSpeaking()
    }
    this.voice.onend = () => {
      if (this.endedSpeaking) this.endedSpeaking()
      this.sayNextMessage()
    }
    this.voice.voice = this.bot.getVoices()[this.params.voiceId]

    this.voice.text = `${msg} .`
    this.voice.wordCount = this.voice.text.split(/\s|-/).length
    this.bot.speak(this.voice)
  }
}

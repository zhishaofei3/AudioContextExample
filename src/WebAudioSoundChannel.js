import EventDispatcher from './EventDispatcher'
import WebAudioDecode from './WebAudioDecode'
import WebAudioEvent from './WebAudioEvent'

export default class WebAudioSoundChannel extends EventDispatcher {

  $url = ''
  $loops = 1
  $audioBuffer = null//AudioBuffer
  _startTime = 0
  $startTime = 0
  _volume = 1
  gain = null
  bufferSource = null
  context = WebAudioDecode.ctx
  isStopped = false

  constructor() {
    super()

    if (this.context["createGain"]) {
      this.gain = this.context["createGain"]()
    } else {
      this.gain = this.context["createGainNode"]()
    }
  }

  $play() {
    console.log('play了', this.$url)
    if (this.isStopped) {
      console.log('this.isStopped')
      return
    }

    if (this.bufferSource) {
      this.bufferSource.onended = null
      this.bufferSource = null
    }
    let context = this.context
    let gain = this.gain
    let bufferSource = context.createBufferSource()
    this.bufferSource = bufferSource
    bufferSource.buffer = this.$audioBuffer
    bufferSource.connect(gain)
    console.log('context.destination', context.destination)
    gain.connect(context.destination)
    bufferSource.onended = this.onPlayEnd

    this._startTime = Date.now()
    console.log('this.gain.gain.value', gain.gain.value)
    gain.gain.value = this._volume
    bufferSource.start(0, this.$startTime)
    console.log('this.$startTime', this.$startTime)
    console.log('bufferSource', bufferSource)
  }

  stop() {
    if (this.bufferSource) {
      let sourceNode = this.bufferSource
      if (sourceNode.stop) {
        sourceNode.stop(0)
      } else {
        sourceNode.noteOff(0)
      }
      sourceNode.onended = null
      sourceNode.disconnect()
      this.bufferSource = null

      this.$audioBuffer = null
    }

    if (!this.isStopped) {
      //sys.$popSoundChannel(this);
    }

    this.isStopped = true
  }

  onPlayEnd() {
    if (this.$loops === 1) {
      this.stop()
      this.dispatchEvent({type: WebAudioEvent.SOUND_COMPLETE});
      return
    }

    if (this.$loops > 0) {
      this.$loops--
    }

    this.$play()
  }

  get volume() {
    return this._volume
  }

  set volume(value) {
    if (this.isStopped) {
      console.log('this.isStopped')
      return
    }

    this._volume = value
    this.gain.gain.value = value
  }

  get position() {
    if (this.bufferSource) {
      return (Date.now() - this._startTime) / 1000 + this.$startTime
    }
    return 0
  }
}
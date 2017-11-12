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
  intervalId = 0

  constructor() {
    super()

    if (this.context["createGain"]) {
      this.gain = this.context["createGain"]()
    } else {
      this.gain = this.context["createGainNode"]()
    }
  }

  $play() {
    let _this = this
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
    gain.connect(context.destination)
    bufferSource.onended = function () {
      _this.onPlayEnd()
    }

    this._startTime = Date.now()
    gain.gain.value = this._volume
    bufferSource.start(0, this.$startTime)

    this.intervalId = setInterval(() => {
      this.dispatchEvent({type: WebAudioEvent.SOUND_PROGRESS, position: this.position});
    }, 500)
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

    if(this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = 0
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
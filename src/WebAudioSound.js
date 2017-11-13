import EventDispatcher from './EventDispatcher'
import WebAudioDecode from './WebAudioDecode'
import WebAudioEvent from './WebAudioEvent'
import WebAudioSoundChannel from './WebAudioSoundChannel'
import axios from 'axios'

let onSoundLoadSuccess = function () {}
let onSoundLoadError = function () {}
let onAudioLoaded = function () {}
let onAudioDecodeError = function () {}

export default class WebAudioSound extends EventDispatcher {
  audioBuffer = null//AudioBuffer
  CancelToken = null

  constructor() {
    super()
    this.CancelToken = axios.CancelToken
    onSoundLoadSuccess = this.onSoundLoadSuccess.bind(this)
    onSoundLoadError = this.onSoundLoadError.bind(this)
    onAudioLoaded = this.onAudioLoaded.bind(this)
    onAudioDecodeError = this.onAudioDecodeError.bind(this)
  }

  get length() {
    if (this.audioBuffer) {
      console.log(this.audioBuffer.duration)
      return this.audioBuffer.duration
    }

    throw new Error("sound not loaded!")
  }

  load(url) {
    this.url = url
    let source = this.CancelToken.source()
    axios({
      method: 'get',
      url,
      responseType: 'arraybuffer',
      timeout: 8000,
      cancelToken: source.token,
      source,
    }).then(onSoundLoadSuccess).catch(onSoundLoadError)
  }

  onSoundLoadSuccess(response) {
    WebAudioDecode.decodeArr.push({
      buffer: response.data,
      success: onAudioLoaded,
      fail: onAudioDecodeError,
      self: this,
      url: this.url
    })
    WebAudioDecode.decodeAudios()
  }

  onSoundLoadError(error) {
    this.dispatchEvent({type: WebAudioEvent.IO_ERROR})
  }

  onAudioLoaded() {
    this.loaded = true
    this.dispatchEvent({type: WebAudioEvent.COMPLETE})
  }

  onAudioDecodeError() {
    this.dispatchEvent({type: WebAudioEvent.SOUND_DECODE_ERROR})
  }

  play(startTime, loops) {
    startTime = +startTime || 0
    loops = +loops || 1

    if (!this.loaded) {
      console.log('this.loaded == false')
    }

    let channel = new WebAudioSoundChannel()
    channel.$url = this.url
    channel.$loops = loops
    channel.$audioBuffer = this.audioBuffer
    channel.$startTime = startTime
    channel.$play()

    //sys.$pushSoundChannel(channel)
    return channel
  }
}
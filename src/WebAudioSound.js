import EventDispatcher from './EventDispatcher'
import WebAudioDecode from './WebAudioDecode'
import WebAudioEvent from './WebAudioEvent'
import WebAudioSoundChannel from './WebAudioSoundChannel'

export default class WebAudioSound extends EventDispatcher {
  audioBuffer = null//AudioBuffer

  constructor() {
    super()
  }

  get length() {
    if (this.audioBuffer) {
      console.log(this.audioBuffer.duration)
      return this.audioBuffer.duration
    }

    throw new Error("sound not loaded!")
  }

  load(url) {
    let self = this
    this.url = url

    let request = new XMLHttpRequest()
    request.open("GET", url, true)
    request.responseType = "arraybuffer"
    request.onreadystatechange = function () {
      if (request.readyState == 4) {// 4 = "loaded"
        let ioError = (request.status >= 400 || request.status == 0)
        if (ioError) {//请求错误
          self.dispatchEvent({type: WebAudioEvent.IO_ERROR})
        } else {
          WebAudioDecode.decodeArr.push({
            buffer: request.response,
            success: onAudioLoaded,
            fail: onAudioError,
            self: self,
            url: self.url
          })
          WebAudioDecode.decodeAudios()
        }
      }
    }
    request.send()
    function onAudioLoaded() {
      self.loaded = true
      self.dispatchEvent({type: WebAudioEvent.COMPLETE})
    }

    function onAudioError() {
      self.dispatchEvent({type: WebAudioEvent.IO_ERROR})
    }
  }

  play(startTime, loops) {
    startTime = +startTime || 0
    loops = +loops || 0

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
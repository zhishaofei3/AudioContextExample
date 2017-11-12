export default class WebAudioDecode {
  static ctx = new (window['AudioContext'] || window['webkitAudioContext'] || window['mozAudioContext'])()
  static decodeArr = []
  static isDecoding = false

  static decodeAudios() {
    if (WebAudioDecode.decodeArr.length <= 0) {
      return
    }
    if (WebAudioDecode.isDecoding) {
      return
    }
    WebAudioDecode.isDecoding = true
    let decodeInfo = WebAudioDecode.decodeArr.shift()

    WebAudioDecode.ctx.decodeAudioData(decodeInfo.buffer, function (audioBuffer) {
      decodeInfo.self.audioBuffer = audioBuffer

      if (decodeInfo.success) {
        decodeInfo.success()
      }
      WebAudioDecode.isDecoding = false
      WebAudioDecode.decodeAudios()
    }, function () {
      if (decodeInfo.fail) {
        decodeInfo.fail()
      }
      WebAudioDecode.isDecoding = false
      WebAudioDecode.decodeAudios()
    })
  }
}
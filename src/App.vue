<template>
  <div id="app">
    <div>
      进度：{{position | toFixed2 }} / {{length | toFixed2}}
    </div>
    <ul>
      <li><a href="#none" target="_self" @click="load()">加载</a></li>
      <li><a href="#none" target="_self" @click="play()">播放</a></li>
      <li><a href="#none" target="_self" @click="pause()">暂停</a></li>
      <li><a href="#none" target="_self" @click="stop()">停止</a></li>
      <li>音量<input type="range" min="0" max="1" step="0.01" v-model="volume"></li>
    </ul>
  </div>
</template>

<script>
  import WebAudioEvent from './WebAudioEvent'
  import WebAudioSound from './WebAudioSound'

  export default {
    name: 'app',
    data () {
      return {
        sound: null,
        soundChannel: null,
        loaded: false,
        volume: 1,
        position: 0,
        length: 0
      }
    },
    created () {
      this.sound = new WebAudioSound()
    },
    methods: {
      load() {
        this.sound.load('yihan.mp3')
        this.sound.addEventListener(WebAudioEvent.COMPLETE, this.onSoundLoadComplete)
        this.sound.addEventListener(WebAudioEvent.IO_ERROR, this.onSoundLoadError)
      },
      play() {
        if (!this.loaded) {
          console.log('还没加载完！')
          return
        }
        let position = 0 || this.position
        this.soundChannel = this.sound.play(position)
        this.soundChannel.addEventListener(WebAudioEvent.SOUND_COMPLETE, this.onSoundComplete)
        this.soundChannel.addEventListener(WebAudioEvent.SOUND_PROGRESS, this.onSoundProgress)
      },
      pause(){
        if (!this.soundChannel) {
          return
        }
        this.position = this.soundChannel.position
        this.clearInterval()
        this.soundChannel.stop()
      },
      stop(isStop) {
        if (!this.soundChannel) {
          return
        }
        this.position = 0
        this.clearInterval()
        this.soundChannel.stop()
      },
      onSoundLoadComplete(e) {
        this.sound.removeEventListener(WebAudioEvent.COMPLETE, this.onSoundLoadComplete)
        this.sound.removeEventListener(WebAudioEvent.IO_ERROR, this.onSoundLoadError)
        this.loaded = true
      },
      onSoundLoadError(e) {
        this.sound.removeEventListener(WebAudioEvent.COMPLETE, this.onSoundLoadComplete)
        this.sound.removeEventListener(WebAudioEvent.IO_ERROR, this.onSoundLoadError)
      },
      onSoundComplete(e) {
        this.soundChannel.removeEventListener(WebAudioEvent.SOUND_COMPLETE, this.onSoundComplete)
        this.soundChannel.removeEventListener(WebAudioEvent.SOUND_PROGRESS, this.onSoundProgress)
      },
      onSoundProgress(e) {
        this.position = e.position
      }
    },
    watch: {
      loaded(val) {
        if(val) {
          this.length = this.sound.length
        }
      },
      volume(val) {
        this.soundChannel.volume = val
      }
    },
    filters: {
      toFixed2 (val) {
        return parseInt(val * 100) / 100
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #42B983;
    margin-top: 60px;
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42B983;
  }
</style>

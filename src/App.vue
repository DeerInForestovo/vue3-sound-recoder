<script setup>
</script>

<script>
import Recorder from "recorder-core";
import 'recorder-core/src/engine/wav'
import 'recorder-core/src/extensions/waveview'
import {ElNotification} from "element-plus";
import {ref} from "vue";

export default {
  data() {
    return {
      isRecording: false,
      soundLength: 0,
      wave: [],
      isPlaying: false,
      playedLength: 0,
      playedPercentage: ref(0),
    }
  },

  methods: {
    recOpen() {
      this.rec = Recorder({
        type: "wav",
        sampleRate: 44100,
        bitRate: 16,
        onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
          if (this.wave) this.wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate)
        }
      });
      this.rec.open(() => {
        if (this.$refs.recwave) {
          this.wave = Recorder.WaveView({elem: this.$refs.recwave})
        }
      }, (msg, isUserNotAllow) => {
        if (isUserNotAllow) {
          ElNotification({
            title: "Failed",
            message: "请同意浏览器录音！",
            type: "error"
          })
        }
      });
    },

    recStart() {
      if (this.rec && !this.isRecording) {
        this.isRecording = true
        this.rec.start()
      }
    },

    recStop() {
      if (!this.rec) {
        return
      }
      this.isRecording = false
      this.rec.stop((blob, duration) => {
        this.recBlob = blob
        this.soundLength = duration
        this.upload(blob);
      }, (err) => {
      });
    },

    upload(blob) { // upload to server

    },

    play(sound) {
      this.isPlaying = true
      this.playedLength = 0
      this.playedPercentage = 0
      let localUrl = URL.createObjectURL(sound)
      let audio = document.createElement("audio")
      audio.controls = true
      // document.body.appendChild(audio)  // show it on the web page
      audio.src = localUrl
      audio.play()
      setTimeout(function () {
        URL.revokeObjectURL(audio.src)
      }, 5000)
    },

    recPlay() {
      if (this.recBlob) {
        this.play(this.recBlob)
      } else {
        ElNotification({
          title: "Failed",
          message: "还没有录音！",
          type: "error"
        })
      }
    },

    resultPlay() {
      if (this.result) {
        this.play(this.result)
      } else {
        ElNotification({
          title: "Failed",
          message: "还没有变音结果！",
          type: "error"
        })
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.recOpen()
      const tickLengthMs = 5
      setInterval(() => {
        if (this.isPlaying) {
          this.playedLength += tickLengthMs
          this.playedPercentage = Math.round(this.playedLength / this.soundLength * 100)
          if (this.playedPercentage > 100) {
            this.playedPercentage = 0
            this.playedLength = 0
            this.isPlaying = false
          }
        }
      }, tickLengthMs)
    })
  },

  unmounted() {
    if (this.rec) {
      this.rec.close()
    }
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="items">
        <h1> sovits 音色转换器 </h1>
      </div>
      <div class="items">
        <h4> 《中文信息处理》 课程小组 </h4>
      </div>
      <div class="items">
        <el-space>
          <el-button @click="recStart" id="beginButton" :disabled="this.isRecording" type="primary"> 开始录音 </el-button>
          <el-button @click="recStop" :disabled="!this.isRecording" type="danger"> 结束录音 </el-button>
        </el-space>
      </div>
      <div class="items">
        <div style="height:100px; width:300px;" ref="recwave"></div>
      </div>
      <div class="items">
        <el-space>
          <el-button @click="recPlay" type="info"> 本地试听 </el-button>
          <el-button @click="upload" type="primary"> 开始变声 </el-button>
          <el-button @click="resultPlay" type="success"> 变声结果 </el-button>
        </el-space>
      </div>
      <div class="items">
        <el-text> {{this.soundLength ? '录音时长：' + this.soundLength / 1000 + ' s' : ''}} </el-text>
      </div>
      <div class="items">
        <el-progress :percentage="this.playedPercentage"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  height: 100vh;
  width: 100vw;
}
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.items {
  padding-bottom: 35px;
}
</style>

<script setup>
</script>

<script>
import Recorder from "recorder-core";
import 'recorder-core/src/engine/wav'
import 'recorder-core/src/extensions/waveview'

export default {
  methods: {
    recOpen() {
      this.rec = Recorder({
        type: "wav",
        sampleRate: 44100,
        bitRate: 24,
        onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
          if (this.wave) this.wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate)
        }
      });

      this.rec.open(() => {
        if (this.$refs.recwave) {
          this.wave = Recorder.WaveView({elem: this.$refs.recwave})
        }
      }, (msg, isUserNotAllow) => {
        console.log(isUserNotAllow)
        console.log(msg)
      });
    },

    recStart() {
      if (!this.rec) {
        console.error("recStart: did not invoke recOpen");
        return
      }
      this.rec.start();
    },

    recStop() {
      if (!this.rec) {
        console.error("recStop: did not invoke recOpen");
        return
      }
      this.rec.stop((blob, duration) => {
        this.recBlob = blob;
        //简单利用URL生成本地文件地址，此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
        const localUrl = (window.URL || webkitURL).createObjectURL(blob);
        console.log("Record finished!")
        console.log(blob)
        console.log(localUrl)
        console.log("Duration = " + duration + "ms")

        this.upload(blob);//把blob文件上传到服务器

        this.rec.close();
        this.rec = null;
      }, (err) => {
        console.error("recStop: rec.stop error: " + err);
        this.rec.close();
        this.rec = null;
      });
    },

    upload(blob) {

    },

    recPlay() {
      let localUrl = URL.createObjectURL(this.recBlob);
      let audio = document.createElement("audio");
      audio.controls = true;
      document.body.appendChild(audio);
      audio.src = localUrl;
      audio.play();

      setTimeout(function () {
        URL.revokeObjectURL(audio.src)
      }, 5000);
    }
  }
}
</script>

<template>
  <div>
    <div>
      <button @click="recOpen">打开录音,请求权限</button>
      <button @click="recStart">开始录音</button>
      <button @click="recStop">结束录音</button>
      <button @click="recPlay">本地试听</button>
    </div>
    <div style="padding-top:5px">
      <div style="border:1px solid #ccc;display:inline-block;vertical-align:bottom">
        <div style="height:100px;width:300px;" ref="recwave"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>

<template>
<section class="container">
  <img src="../static/img/logo.png" alt="Nuxt.js Logo" class="logo" />
  <h1 class="title">
      This page is loaded from the {{ name }}
    </h1>
  <h2 class="info" v-if="name === 'client'">
      Please refresh the page
    </h2>
  <nuxt-link class="button" to="/">
    Home page
  </nuxt-link>
</section>
</template>
<script>
import { mapActions } from 'vuex'
import axios from 'axios'

export default {
  asyncData({ req }) {
    return {
      name: req ? 'server' : 'client'
    }
  },
  head() {
    return {
      title: `About Page (${this.name}-side)`
    }
  },
  methods: {
    ...mapActions([
      'getWechatSignature'
    ])
  },
  beforeMount() {
    console.log(1)
    const wx = window.wx
    const url = window.location.href

    this.getWechatSignature(url).then(res => {
      if(res.data.success) {
        const params = res.data.params
        wx.config({
          debug: true,
          appId: params.appID,
          timestamp: params.timestamp,
          nonceStr: params.noncestr,
          signature: params.signature,
          jsApiList: [
            'previewImage',
            'uploadImage',
            'downloadImage',
            'hideAllNonBaseMenuItem'
          ]
        })
        wx.ready(() => {
          wx.hideAllNonBaseMenuItem()
          console.log('success')
        })
      }
    })
  }
}
</script>

<style scoped>
.title {
  margin-top: 50px;
}

.info {
  font-weight: 300;
  color: #9aabb1;
  margin: 0;
  margin-top: 10px;
}

.button {
  margin-top: 50px;
}
</style>

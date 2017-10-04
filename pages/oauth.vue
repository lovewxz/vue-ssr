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
  head() {
    return {
      title: 'loading'
    }
  },
  methods: {
    _getUrlParam(param) {
      const reg = new RegExp(`(^|&)${param}=([^&]*)(&|$)`)
      const result = window.location.search.substr(1).match(reg)
      return result ? decodeURIComponent(result[2]) : null
    },
    ...mapActions([
      'getWechatOauth',
      'setAuthUser'
    ])
  },
  async beforeMount() {
    const url = window.location.href
    const { data } = await this.getWechatOauth(url)
    console.log(data)
    if (data.success) {
      await this.setAuthUser(data.data)
      const paramsArr = this._getUrlParam('state').split('_')
      const visit = paramsArr.length === 1 ? `/${paramsArr[0]}` : `/${paramsArr[0]}?id=${paramsArr[1]}`
      this.$router.replace(visit)
    } else {
      throw new Error('用户信息获取失败')
    }
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

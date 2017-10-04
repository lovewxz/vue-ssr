<template>
  <div>
   <h1>hello nuxt</h1>
  </div>
</template>
<script>
export default {
  head() {
    return {
      title: 'index'
    }
  },
  middleware: 'wechat-oauth'
}
</script>
<style>
</style>

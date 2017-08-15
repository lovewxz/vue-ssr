import axios from 'axios'

export const getWechatSignature = function ({ commit }, url) {
  return axios.get(`/wechat-signature?url=${url}`)
}

export const getUserInfo = function({commit}, url) {
  return axios.get(`/wechat-oauth?url=${url}`)
}

import axios from 'axios'
import * as types from './mutation-types.js'

export const getWechatSignature = function ({ commit }, url) {
  return axios.get(`/wechat-signature?url=${url}`)
}

export const getUserInfo = function ({ commit }, url) {
  return axios.get(`/wechat-oauth?url=${url}`)
}

export const setAuthUser = function ({ commit }, authUser) {
  commit('SET_AUTHUSER', authUser)
}

export const getWechatOauth = function ({ commit }, url) {
  return axios.get(`/wechat-oauth?url=${url}`)
}

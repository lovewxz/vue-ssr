import * as types from './mutation-types.js'

const mutations = {
  [types.SET_AUTHUSER](state,authUser) {
    state.authUser = authUser
  }
}

export default mutations

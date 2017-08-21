import Router from 'koa-router'
import _ from 'lodash'
import glob from 'glob'
import { resolve } from 'path'

export let routersMap = new Map()

export const symbolPrefix = Symbol('prefix')

/**格式化路径**/
export const normalizePath = path => path.startsWith('/') ? path : `/${path}`

/**方便rest运算符计算**/
export const isArray = v => _.isArray(v) ? v : [v]

export default class Route {
  constructor(app, apiPath) {
    this.app = app
    this.router = new Router()
    this.apiPath = apiPath
  }
  init() {
    glob.sync(resolve(this.apiPath, './*.js')).forEach(require)
    for (let [conf, controller] of routersMap) {
      const controllers = isArray(controller)
      let prefixPath = conf.target[symbolPrefix]
      if (prefixPath) prefixPath = normalizePath(prefixPath)
      const routerPath = prefixPath + conf.path
      console.log(routerPath)
      this.router[conf.method](routerPath, ...controllers)
    }
    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
  }
}

export const router = conf => (target, key, descriptor) => {
  conf.path = normalizePath(conf.path)
  routersMap.set({
    target: target,
    ...conf
  }, target[key])
}

export const controller = path => target => target.prototype[symbolPrefix] = path

export const get = path => router({
  method: 'get',
  path: path
})

export const post = path => router({
  method: 'post',
  path: path
})

export const put = path => router({
  method: 'put',
  path: path
})

export const del = path => router({
  method: 'del',
  path: path
})

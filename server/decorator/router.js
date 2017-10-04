import Router from 'koa-router'
import _ from 'lodash'
import glob from 'glob'
import { resolve } from 'path'
import R from 'ramda'
import jwt from 'jsonwebtoken'

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
      console.log(controllers)
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


const decorate = (args, middleware) => {
  let [target, key, descriptor] = args
  target[key] = isArray(target[key])
  target[key].unshift(middleware)
  console.log(descriptor)
  return descriptor
}
const convert = middleware => (...args) => decorate(args, middleware)

// require
export const required = rules => convert(async(ctx, next) => {
  let errors = []
  const passRules = R.forEachObjIndexed(
    (val, key) => {
      errors = R.filter(i => {
        return !R.has(i, ctx.request[key])
      })(val)
    }
  ) // 判断请求中参数是否为空
  passRules(rules)
  if (errors.length) ctx.throw(412, `${errors.join(', ')}参数缺失`)
  await next()
})

export const checkToken = () => convert(async(ctx, next) => {
  const authorization = ctx.get('Authorization')
  if (authorization === '') {
    ctx.throw(401, '没有验证信息')
  }
  const token = authorization.split(' ')[1]
  let tokenContent
  try {
    tokenContent = await jwt.verify(token, 'yaojun')
  } catch (e) {
    ctx.throw(401, '验证信息过期')
  }
  await next()
})

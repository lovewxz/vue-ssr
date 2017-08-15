import Router from 'koa-router'
import config from '../config'
import { getWechat } from '../wechat'
import reply from '../wechat/reply'
import wechatMiddleWare from '../wechat-lib/middleware'
import { signature, redirect, oauth } from '../controllers/wechatController'

export const router = (app) => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddleWare(config.wechat, reply)) // 把微信服务端的信息传入中间件处理
  router.get('/wechat-signature', signature)
  router.get('/wechat-redirect', redirect)
  router.get('/wechat-oauth', oauth)
  app
    .use(router.routes())
    .use(router.allowedMethods())
}

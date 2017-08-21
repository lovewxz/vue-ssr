import Router from 'koa-router'
import config from '../config'
import { getWechat } from '../wechat'
import reply from '../wechat/reply'
import wechatMiddleWare from '../wechat-lib/middleware'
import { signature, redirect, oauth } from '../controllers/wechatController'
import { post, get, controller } from '../decorator/router'

@controller('')
export class WechatController {
  @get('/wechat-hear')
  async wechatHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle(ctx, next)
    ctx.body = body
  }

  @post('/wechat-hear')
  async wechatPostHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle(ctx, next)
    ctx.body = body
  }

  @get('/wechat-signature')
  async wechatSignature(ctx, next) {
    await signature(ctx, next)
  }

  @get('/wechat-redirect')
  async wechatRedirect(ctx, next) {
    await redirect(ctx, next)
  }

  @get('/wechat-oauth')
  async wechatOauth(ctx, next) {
    await oauth(ctx, next)
  }
}

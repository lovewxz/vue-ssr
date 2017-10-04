import mongoose from 'mongoose'
import { controller, get, post, put, del } from '../decorator/router'
import QiniuSDK from '../lib/qiniuSDK'

const qiniu = new QiniuSDK()

@controller('/qiniu')
export class QiniuController {
  @get('/uptoken')
  async qiniuToken(ctx,next) {
    let key = ctx.query.key
    let token = qiniu.uptoken(key)
    ctx.body = {
      success: true,
      data: token
    }
  }
}

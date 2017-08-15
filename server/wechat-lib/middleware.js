import sha1 from 'sha1'
import getRawBody from 'raw-body'
import * as util from './util'
import reply from '../wechat/reply'

export default function (opts, reply) {
  return async function wechatMiddleWare(ctx, next) {
    const token = opts.token // 传入微信配置的token值
    const { signature, timestamp, nonce, echostr } = ctx.query  // 获取上下文中的query中的值
    const str = [token, timestamp, nonce].sort().join('') // 字典排序
    const sha = sha1(str) // sha1加密
    if (ctx.method === 'GET') { // 验证是否通过
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'failed'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = 'failed'
        return false
      }
      // 获取微信服务器发来的buffer数据
      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      // 解析xml数据
      const content = await util.parseXML(data)
      // 将xml转成js对象
      const message = util.formateMessage(content.xml)
      // 将解析后的xml挂在到ctx的属性上，共享数据
      ctx.weixin = message
      // 将解析后的数据传入reply策略中处理
      await reply.apply(ctx, [ctx, next])
      const replyBody = ctx.body
      const msg = ctx.weixin
      // 将回复内容解析成xml格式 发送被动回复的消息 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543
      const xml = util.tpl(replyBody, msg)
      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}

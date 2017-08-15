import { getWechat } from '../wechat'

export default async (ctx, next) => {
  const message = ctx.weixin  // 获取微信的回复的消息
  let type = message.MsgType // 判断微信回复的类型
  let eventType = message.Event // 判断微信事件回复的类型

  switch (type) {
    case 'text':
      ctx.body = message.Content
      if (message.Content === "1") {
        let wechat = getWechat()
        const data = await wechat.handlerOperation('getBlackList')
        console.log(data)
      }
      break
    case 'image':
      ctx.body = {
        type,
        mediaId: message.MediaId
      }
      break
    case 'voice':
      ctx.body = {
        type,
        mediaId: message.MediaId
      }
      break
    case 'video':
      ctx.body = {
        type,
        mediaId: message.MediaId,
        title: message.ThumbMediaId
      }
      break
    case 'location':
      ctx.body = message.Label
      break
    case 'link':
      ctx.body = message.title
    case 'event':
      switch (eventType) {
        case 'subscribe':
          ctx.body = '你关注我了'
          break
        case 'unsubscribe':
          console.log('你取消关注了')
          break
        case 'Location':
          ctx.body = message.Latitude
          break
        default:
          break
      }
    default:
      break
  }
}

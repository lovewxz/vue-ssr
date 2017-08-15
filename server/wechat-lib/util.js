import xml2js from 'xml2js'
import template from './tpl'
import sha1 from 'sha1'

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { trim: true }, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}
/**
 * 格式化xml2js之后的对象,使其成为一个标准的对象
 * @param  {Object} XML2JS对象 [经过XML2JS处理后的对象]
 * @return {Object}         [标准对象]
 */
function formateMessage(result) {
  let message = {}
  if (typeof result === 'object') {
    for (let [key, value] of Object.entries(result)) {
      if (!(value instanceof Array) || value.length === 0) {
        continue
      }
      if (value.length === 1) {
        let item = value[0]
        if (typeof item === 'object') {
          message[key] = formateMessage(item)
        } else {
          message[key] = (item || '')
        }
      } else {
        message[key] = []
        for (let j = 0; j < value.length; j++) {
          message[key].push(formateMessage(value[j]))
        }
      }
    }
  }
  return message
}

/**
 * 把回复的内容转换成xml
 * @param  {Object} 回复的内容 [description]
 * @param  {Object} xml转换成对象后的数据 [description]
 * @return xml模板         [description]
 */
function tpl(content, message) {
  let type = 'text' // 默认为文本推送类型
  if (Array.isArray(content)) {
    type = 'news'
  }
  if (!content) {
    content = 'empty news'
  }
  if (content && content.type) {
    type = content.type
  }
  let info = {
    msgType: type,
    createTime: new Date().getTime(),
    content: content,
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  }
  return template(info)
}

function _signIt(ticket, url, noncestr, timestamp) {
  let ret = {
    noncestr: noncestr,
    jsapi_ticket: ticket,
    timestamp: timestamp,
    url: url
  }
  // 获取对象的值并进行排序
  let keys = Object.keys(ret).sort()
  let newObj = {}
  // 遍历key得到一个新的有序的Obj
  keys.forEach((item) => {
    newObj[item.toLowerCase()] = ret[item]
  })
  let str = ''
  // 构建成url的格式
  for (let [k, v] of Object.entries(newObj)) {
    str += `&${k}=${v}`
  }
  let sha = sha1(str.substr(1))
  return sha
}

function _createNonceStr() {
  return Math.random().toString(30).substr(2, 11)
}

function _createTimeStamp() {
  return parseInt(new Date().getTime() / 1000)
}

/**
 * 返回wx.config的参数
 * @param  {String} ticket [jssdk票据值]
 * @param  {String} url    [jssdk URL地址]
 * @return {Object}        [description]
 */
function sign(ticket, url) {
  const noncestr = _createNonceStr()
  const timestamp = _createTimeStamp()
  const signature = _signIt(ticket, url, noncestr, timestamp)
  return {
    noncestr,
    timestamp,
    signature
  }
}

export {
  parseXML,
  formateMessage,
  tpl,
  sign
}

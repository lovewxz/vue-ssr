import axios from 'axios'
import fs from 'fs'
import request from 'request-promise'
import { sign } from './util'

const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
  accessToken: `${base}token?grant_type=client_credential`,
  temporary: {
    upload: `${base}media/upload?`,
    fetch: `${base}media/get?`
  },
  permanent: {
    upload: `${base}material/add_material?`,
    uploadNews: `${base}material/add_news?`,
    uploadNewsPic: `${base}media/uploadimg?`,
    fetch: `${base}material/get_material?`,
    del: `${base}material/del_material?`,
    update: `${base}material/update_news?`,
    count: `${base}material/get_materialcount?`,
    batch: `${base}material/batchget_material?`
  },
  tag: {
    create: `${base}tags/create?`,
    fetch: `${base}tags/get?`,
    update: `${base}tags/update?`,
    del: `${base}tags/delete?`,
    fetchList: `${base}user/tag/get?`
  },
  user: {
    batchTagging: `${base}tags/members/batchtagging?`,
    batchUnTagging: `${base}tags/members/batchuntagging?`,
    getTagsList: `${base}tags/getidlist?`,
    remark: `${base}user/info/updateremark?`,
    info: `${base}user/info?`,
    batchInfoList: `${base}user/info/batchget?`,
    getSubscribeList: `${base}user/get?`,
    getBlackList: `${base}tags/members/getblacklist?`,
    batchBlackList: `${base}tags/members/batchblacklist?`,
    batchUnBlackList: `${base}tags/members/batchunblacklist?`
  },
  ticket: `${base}ticket/getticket?`
}


export default class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
    this.fetchAccessToken()
  }

  async request(options) {
    options = Object.assign({}, options, { json: true })
    try {
      const response = await request(options)
      return response
    } catch (error) {
      console.error(error)
    }
  }


  async fetchAccessToken() {
    let data = await this.getAccessToken()
    if (!this.isVailToken(data, 'access_token')) {
      data = await this.updateAccessToken()
    }
    await this.saveAccessToken(data)
    return data
  }

  async updateAccessToken() {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`
    const data = await this.request({ url: url })
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000
    data.expires_in = expiresIn
    return data
  }

  async fetchTicket(token) {
    let data = await this.getTicket()
    if (!this.isVailToken(data, 'ticket')) {
      data = await this.updateTicket(token)
    }
    await this.saveTicket(data)
    return data
  }

  async updateTicket(token) {
    const url = `${api.ticket}access_token=${token}&type=jsapi`
    const data = await this.request({ url: url })
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000
    data.expires_in = expiresIn
    return data
  }

  /**
   * 获取接入jssdk的签名的值
   * @param  {String} ticket [jssdk票据值]
   * @param  {String} url   [需要验证的URL地址]
   * @return {Object}       [wx.config]
   */
  ticketSignature(ticket, url) {
    return sign(ticket, url)
  }

  isVailToken(data, name) {
    if (!data || !data[name] || !data.expires_in) {
      return false
    }
    const now = new Date().getTime()
    if (now < data.expires_in) {
      return true
    } else {
      return false
    }
  }
  /**
   * 抽离出函数中的公共的发送请求部分
   * @param  {String}  operation [函数名]
   * @param  {Argument}  args      [剩余参数]
   * @return {Promise} 返回的数据对象    [description]
   */
  async handlerOperation(operation, ...args) {
    const tokenData = await this.fetchAccessToken()
    const options = await this[operation](tokenData.access_token, ...args)
    const data = await this.request(options)
    return data
  }

  /**
   * 上传素材,配置素材的参数
   * @param  {String} token     [票据值]
   * @param  {String} type      [类型值,分为图文素材,图文图片素材,其他素材]
   * @param  {String} material  [素材路径] ||  {Object} material  [图文消息]
   * @param  {Object} permanent [是否为永久素材]
   * @return {Object}           [请求的参数]
   */
  uploadMaterial(token, type, material, permanent) {
    if (!token || !material) {
      return
    }
    // 定义空的form对象
    let form = {}
    // 默认上传为临时素材
    let url = api.temporary.upload
    // 是否为永久素材
    if (permanent) {
      url = api.permanent.upload
      //合并传入的永久素材的参数
      Object.assign(form, permanent)
    }
    switch (type) {
      case 'pic':
        url = api.permanent.uploadNewsPic
        form.media = fs.createReadStream(material)
        break
      case 'news':
        url = api.permanent.uploadNews
        // 如果为图文素材，传入的是一个数组
        form = material
        break
      default:
        form.media = fs.createReadStream(material)
    }
    // 构建上传的地址
    let uploadUrl = `${url}access_token=${token}`
    if (!permanent) {
      // 不是永久素材，需要加上type属性
      uploadUrl += `&type=${type}`
    } else {
      // 不是图文素材的永久素材，需要post票据值
      if (type !== 'pic' && type !== 'news') {
        uploadUrl += `&type=${type}`
      }
      if (type !== 'news') {
        form.access_token = token
      }
    }
    const options = {
      method: 'post',
      url: uploadUrl
    }
    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }
    return options
  }

  /**
   * 获取素材接口
   * @param  {String} token     [票据值]
   * @param  {String} type      [素材类型]
   * @param  {String} mediaId   [素材ID号]
   * @param  {Object} permanent [是否为永久素材]
   * @return {Object} options    [请求的参数]
   */
  fetchMaterial(token, type, mediaId, permanent) {
    if (!token || !mediaId) {
      return
    }
    let url = `${api.temporary.fetch}access_token=${token}`
    let form = {}
    form = Object.assign({}, form, permanent)
    if (permanent) {
      url = `${api.permanent.fetch}access_token=${token}`
      form.media_id = mediaId
      return { method: 'POST', body: form, url: url }
    } else {
      url += `&media_id=${mediaId}`
      if (type === 'video') {
        url = url.replace('https://', 'http://')
      }
      return { method: 'GET', url: url }
    }
    return false
  }

  /**
   * 删除素材接口，永久素材专用
   * @param  {String} token    [票据值]
   * @param  {String} meidiaId [素材ID]
   * @return {Object} options  [请求参数]
   */
  delMaterial(token, meidiaId) {
    if (!token || !mediaId) {
      return
    }
    let form = {}
    let url = `${api.permanent.del}access_token=${token}`
    form.media_id = meidiaId
    return { method: 'POST', url: url, body: form }
  }

  /**
   * 更新素材接口,永久素材中的图文素材专用
   * @param  {String} token    [票据值]
   * @param  {String} meidiaId [素材ID]
   * @param  {Object} article [更新的文章对象]
   * @param  {Number} index   [文章所在的序号]
   * @return {Object}         [请求参数]
   */
  updateMaterial(token, mediaId, article, index) {
    if (!token || !article) {
      return
    }
    index = index || 0
    let form = Object.assign({}, { index: index, media_id: meidiaId }, article)
    let url = `${api.permanent.update}access_token=${token}`
    return { method: 'POST', url: url, body: form }
  }

  /**
   * 获取素材的总数，永久素材专用
   * @param  {String} token    [票据值]
   * @return {Object}         [请求参数]
   */
  fetchMaterialCount(token) {
    if (!token) {
      return
    }
    let url = `${api.permanent.count}access_token=${token}`
    return { url: url }
  }

  /**
   * 获取素材列表，永久素材专用
   * @param  {String} token    [票据值]
   * @param  {String} type   [查询的类型]
   * @param  {Number} offset [偏移量]
   * @param  {Number} count  [查询个数]
   * @return {Object}         [请求参数]
   */
  batchMaterial(token, type, offset, count) {
    if (!token) {
      return
    }
    let url = `${api.permanent.batch}access_token=${token}`
    let form = {
      type: type || 'image',
      offset: offset || 0,
      count: count || 10
    }
    return { method: 'POST', url: url, body: from }
  }
  /**
   * 创建分组(标签)
   * @param  {String} token    [票据值]
   * @param  {String} name  [分组名称]
   * @return 返回创建的标签，并由微信分配ID       [description]
   */
  createTags(token, name) {
    if (!token || !name) {
      return
    }
    let url = `${api.tag.create}access_token=${token}`
    const form = {
      tag: {
        name: name
      }
    }
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 获取公众号已创建的标签
   * @param  {String} token    [票据值]
   * @return 返回创建标签列表       [description]
   */
  fetchTags(token) {
    if (!token) {
      return
    }
    let url = `${api.tag.fetch}access_token=${token}`
    return { method: 'GET', url: url }
  }
  /**
   * 编辑标签
   * @param  {String} token    [票据值]
   * @param  {Number} id  [标签ID]
   * @param {String}  name     [标签名称]
   * @return errcode
   */
  updateTags(token, id, name) {
    const form = {
      tag: {
        id: id,
        name: name
      }
    }
    let url = `${api.tag.update}access_token=${token}`
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 删除标签
   * @param  {String} token    [票据值]
   * @param  {Number} id  [标签ID]
   * @return errcode
   */
  delTags(token, id) {
    if (!id && id === 0) {
      return
    }
    const form = {
      tag: {
        id: id
      }
    }
    let url = `${api.tag.del}access_token=${token}`
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 获取标签下粉丝列表
   * @param  {String} token    [票据值]
   * @param  {Number} id    [标签ID]
   * @param  {String} nextOpenId    [第一个拉取的OPENID，不填默认从头开始拉取]
   * @return 粉丝列表      [description]
   */
  fetchListByTag(token, id, nextOpenId) {
    if (!id && id === 0) {
      return
    }
    let url = `${api.tag.fetchList}access_token=${token}`
    const form = {
      tagid: id,
      next_openid: nextOpenId || ''
    }
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 批量为用户打标签
   * @param  {String} token    [票据值]
   * @param  {Number} tagid    [标签ID]
   * @param  {Array} openList [粉丝列表]
   * @param  {Boolean} unTagging [是否为取消标签]
   * @return errcode          [description]
   */
  batchTagging(token, tagid, openList, unTagging) {
    if (!Array.isArray(openList)) {
      return
    }
    const form = {
      openid_list: openList,
      tagid: tagid
    }
    let url = `${api.user.batchTagging}access_token=${token}`
    if (unTagging) {
      url = `${api.user.batchUnTagging}access_token=${token}`
    }
    return { method: 'POST', url: url, body: form }
  }

  /**
   * 获取用户身上的标签列表
   * @param  {String} token    [票据值]
   * @param  {String} openId [标识值]
   * @return Array      被置上的标签列表
   */
  getTagsList(token, openId) {
    let url = `${api.user.getTagsList}access_token=${token}`
    const form = {
      openid: openId
    }
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 设置用户备注名
   * @param  {String} token    [票据值]
   * @param  {String} openId [标识值]
   * @param  {String} remark [备注名]
   * @return errcode
   */
  setUserRemark(token, openId, remark) {
    let url = `${api.user.remark}access_token=${token}`
    const form = {
      openid: openId,
      remark: remark
    }
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 获取用户基本信息(UnionID机制)
   * @param  {String} token    [票据值]
   * @param  {String} openId [标识值]
   * @param  {String} lang   [国家地区语言版本]
   * @return Object       [用户信息]
   */
  getUserInfo(token, openId, lang) {
    let url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_cn'}`
    return { url: url }
  }
  /**
   * 批量获取用户基本信息，最多支持一次拉取100条。
   * @param  {String} token    [票据值]
   * @param  {Array} userList [用户openId数组]
   * @return {Object}          [用户列表信息]
   */
  batchUserInfoList(token, userList, lang) {
    let url = `${api.user.batchInfoList}access_token=${token}`
    let form = {}
    let arr = []
    userList.forEach((item) => {
      const obj = {
        openid: item,
        lang: lang || 'zh-cn'
      }
      arr.push(obj)
    })
    form.user_list = arr
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 获取帐号的关注者列表，一次拉取调用最多拉取10000个关注者的OpenID，可以通过多次拉取的方式来满足需求。
   * @param  {String} token    [票据值]
   * @param  {String} nextOpenId [第一个拉取的OPENID]
   * @return {Object}            [json数据包]
   */
  getSubscribeList(token, nextOpenId) {
    let url = `${api.user.getSubscribeList}access_token=${token}&next_openid=${nextOpenId || ''}`
    return { url: url }
  }
  /**
   * 获取公众号的黑名单列表
   * @param  {String} token    [票据值]
   * @param  {String} beginOpenId [当 begin_openid 为空时，默认从开头拉取。]
   * @return {Object}             [description]
   */
  getBlackList(token, beginOpenId) {
    let url = `${api.user.getBlackList}access_token=${token}`
    const form = {
      begin_openid: beginOpenId || ''
    }
    return { method: 'POST', url: url, body: form }
  }
  /**
   * 拉黑/取消拉黑用户
   * @param  {String} token    [票据值]
   * @param  {Array} openList    [openId数组]
   * @param  {Boolean} unBlackList [是否取消拉黑]
   * @return {Object}             [description]
   */
  batchBlackList(token, openList, unBlackList) {
    let url = `${api.user.batchBlackList}access_token=${token}`
    const form = {
      openid_list: openList
    }
    if (unBlackList) {
      url = `${api.user.batchUnBlackList}access_token=${token}`
    }
    return { method: 'POST', url: url, body: form }
  }
}

import api from '../api'
import { parse as urlParse } from 'url'
import { parse as queryParse } from 'querystring'
import config from '../config'

export async function signature(ctx, next) {
  let url = ctx.query.url
  url = decodeURIComponent(url)
  if (!url) ctx.throw(404)
  const params = await api.wechat.getSignatureAsync(url)
  ctx.body = {
    success: true,
    params: params
  }
}

export async function redirect(ctx, next) {
  const target = `${config.SITE_URL}/oauth`
  const scope = 'snsapi_userinfo'
  const {visit, id} = ctx.query

  const params = id ? `${visit}_${id}` : visit
  const url = api.wechat.getAuthorizeURL(target, scope, params)
  ctx.redirect(url)
}

export async function oauth(ctx, next) {
  let url = ctx.query.url
  url = decodeURIComponent(url)
  const urlObj = urlParse(url)
  const params = queryParse(urlObj.query)
  const code = params.code
  const userInfo = await api.wechat.getUserInfoByCode(code)
  console.log(userInfo)
  ctx.body = {
    success: true,
    data: userInfo
  }
}

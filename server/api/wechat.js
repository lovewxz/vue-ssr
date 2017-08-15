import { getWechat, getOAuth } from '../wechat'

export async function getSignatureAsync(url) {
  const Wechat = getWechat()
  const tokenData = await Wechat.fetchAccessToken()
  const acessToken = tokenData.access_token
  const ticketData = await Wechat.fetchTicket(acessToken)
  const ticket = ticketData.ticket
  const params = await Wechat.ticketSignature(ticket, url)
  params.appID = Wechat.appID
  return params
}

export function getAuthorizeURL(...args) {
  const OAuth = getOAuth()
  return OAuth.getAuthorizeURL(...args)
}


export async function getUserInfoByCode(code) {
  const OAuth = getOAuth()
  const data = await OAuth.fetchAccessToken(code)
  console.log(data)
  const userInfo = await OAuth.getUserInfo(data.access_token, data.openid)
  return userInfo
}

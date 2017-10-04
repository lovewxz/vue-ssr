import api from '../api'
import { controller, get, post, put, del, required } from '../decorator/router'

@controller('/admin')
export class adminController {
  @post('/login')
  @required({ body: ['email', 'password'] })
  async login(ctx, next) {
    const { email, password } = ctx.request.body
    const data = await api.user.login(email, password)
    const { match, user } = data
    if (match) {
      return ctx.body = {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          token: user.token
        }
      }
    }
    return ctx.body = {
      success: false,
      err: '密码或账号错误'
    }
  }
}

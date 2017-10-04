import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors'

export const addBody = app => {
  app.use(cors())
  app.use(bodyParser())
}

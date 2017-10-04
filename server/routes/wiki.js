import mongoose from 'mongoose'
import api from '../api'
import { controller, get, post } from '../decorator/router'

const WikiHouse = mongoose.model('WikiHouse')
const WikiCharacter = mongoose.model('WikiCharacter')

@controller('/wiki')
export class WikiController {
  @get('/houses')
  async getHouses(ctx, next) {
    const houses = await api.wiki.getHouses()
    ctx.body = {
      success: true,
      data: houses
    }
  }
  @get('/houses/:_id')
  async getHouse(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) {
      ctx.body = {
        success: false,
        err: 'id不存在'
      }
    }
    const house = await api.wiki.getHouse(_id)
    ctx.body = {
      success: true,
      data: house
    }
  }
  @get('/characters')
  async getCharater(ctx, next) {
    const { limit } = ctx.query
    const characters = await api.wiki.getCharater(limit)
    ctx.body = {
      success: true,
      data: characters
    }
  }

  @get('/characters/:_id')
  async getCharaters(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) {
      ctx.body = {
        success: false,
        err: 'id不存在'
      }
    }
    const character = await api.wiki.getCharaters(_id)
    ctx.body = {
      success: true,
      data: character
    }
  }
}

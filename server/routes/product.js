import mongoose from 'mongoose'
import api from '../api'
import { controller, get, post, put, del, checkToken } from '../decorator/router'
import xss from 'xss'
import R from 'ramda'


const Product = mongoose.model('Product')

@controller('/api')
export class ProductController {
  @get('/products')
  @checkToken()
  async getProducts(ctx, next) {
    const { limit = 50 } = ctx.query
    const products = await api.product.getProducts(limit)
    ctx.body = {
      success: true,
      data: products
    }
  }
  @get('/products/:_id')
  @checkToken()
  async getProduct(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) {
      return ctx.body = {
        success: false,
        err: 'id不存在'
      }
    }
    const product = await api.product.getProduct(_id)
    ctx.body = {
      success: true,
      data: product
    }
  }
  @post('/products')
  @checkToken()
  async createProducts(ctx, next) {
    let product = ctx.request.body
    product = {
      title: xss(product.title),
      price: xss(product.price),
      intro: xss(product.intro),
      images: R.map(xss)(product.images),
      parameters: R.map(item => ({
        key: xss(item.key),
        value: xss(item.value)
      }))(product.parameters)
    }
    product = await api.product.save(product)
    ctx.body = {
      success: true,
      data: product
    }
  }
  @put('/products')
  @checkToken()
  async putProducts(ctx, next) {
    let body = ctx.request.body
    const { _id } = body
    if (!_id) {
      return ctx.body = {
        success: false,
        err: 'id不存在'
      }
    }
    let product = await api.product.getProduct(_id)
    if (!product) {
      return ctx.body = {
        success: false,
        err: '宝贝不存在'
      }
    }
    product.title = xss(body.title)
    product.price = xss(body.price)
    product.intro = xss(body.intro)
    product.images = R.map(xss)(body.images)
    product.parameters = R.map(item => ({
      key: xss(item.key),
      value: xss(item.value)
    }))(body.parameters)

    try {
      product = await api.product.update(product)
      ctx.body = {
        success: true,
        data: product
      }
    } catch (e) {
      ctx.body = {
        success: false,
        err: e
      }
    }
  }
  @del('/products/:_id')
  @checkToken()
  async delProducts(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) {
      return ctx.body = {
        success: false,
        err: 'id不存在'
      }
    }
    let product = await api.product.getProduct(_id)
    if (!product) {
      return ctx.body = {
        success: false,
        err: '宝贝不存在'
      }
    }
    try {
      await api.product.del(product)
      ctx.body = {
        success: true
      }
    } catch (e) {
      ctx.body = {
        success: false,
        err: e
      }
    }
  }
}

import mongoose from 'mongoose'
import config from '../config'
import { resolve } from 'path'
import fs from 'fs'
import R from 'ramda'

const models = resolve(__dirname, '../database/schema')

// 读入目录中所有的models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/)) // ~代表取反减1,不加~返回查询的位置为0，所以取反不被过滤
  .forEach(file => require(resolve(models, file)))

const formatData = R.map(i => {
  i._id = i.nmId
  return i
})

const wikiHouses = require(resolve(__dirname,'../../completeHouses.json'))
let wikiCharacters = require(resolve(__dirname,'../../completeCharaters.json'))

wikiCharacters = formatData(wikiCharacters)

export const database = app => {
  mongoose.set('dubeg', true) // 本地开发操作
  mongoose.connect(config.db) // 连接MongoDB
  mongoose.connection.on('disconnected', () => {
    mongoose.connect(config.db)
  }) // 当mongodb的连接中断，重新连接
  mongoose.connection.on('err', (err) => {
    console.error(err)
  })// 当mongodb发生错误，打印错误信息
  mongoose.connection.on('open', async () => {
    console.log('Connect to MongoDB', config.db)
    const WikiHouse = mongoose.model('WikiHouse')
    const WikiCharacter = mongoose.model('WikiCharacter')
    const User = mongoose.model('User')

    const existWikiHouse = await WikiHouse.find({}).exec()
    const existCharacter = await WikiCharacter.find({}).exec()

    if(!existWikiHouse.length) WikiHouse.insertMany(wikiHouses)
    if(!existCharacter.length) WikiCharacter.insertMany(wikiCharacters)
    console.log('写入数据库')
    let user = await User.findOne({
      email: 'yaojun@qq.com'
    }).exec()
    if(!user) {
      user = new User({
        email: 'yaojun@qq.com',
        password: '123456',
        role: 'admin'
      })
      await user.save()
    }
  })
}

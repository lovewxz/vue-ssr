import rq from 'request-promise'
import _ from 'lodash'
import { writeFileSync } from 'fs'

const sleep = time => new Promise((resolve, reject) => {
  if (time) {
    clearTimeout(time)
  }
  setTimeout(resolve, time)
})
let characters = []
export const getAPICharaters = async(page = 1) => {
  const url = `https://www.anapioficeandfire.com/api/characters?page=${page}&pageSize=50`
  console.log(`正在爬${page}页数据`)
  let body = await rq(url)
  body = JSON.parse(body)
  characters = _.union(characters, body)
  console.log(`正在爬${characters.length}条数据`)
  if (body.length < 50) {
    console.log('爬完了')
    return
  } else {
    writeFileSync('./characters.json', JSON.stringify(characters, null, 2), 'utf-8')
    await sleep(1000)
    page++
    getAPICharaters(page)
  }
}


getAPICharaters()

import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
const sleep = (time) => {
  return new Promise((resolve, reject) => {
    if (time) {
      clearTimeout(time)
    }
    setTimeout(resolve, time)
  })
}

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'http://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    transform: body => {
      return cheerio.load(body)
    }
  }
  const $ = await rp(options)
  let photos = []
  $('table.cast_list tr.odd, tr.even').each(function () {
    const nmIdDom = $(this).find('td.itemprop a')
    const nmId = nmIdDom.attr('href')
    const chIdDom = $(this).find('td.character a')
    const chId = chIdDom.attr('href')
    const name = chIdDom.text()
    const playedByDom = $(this).find('td.itemprop span.itemprop')
    const playedBy = playedByDom.text()
    photos.push({
      nmId,
      chId,
      name,
      playedBy
    })
  })
  console.log(`共爬到${photos.length}条数据`)
  const fn = R.compose(
    R.map((photo) => {
      const reg1 = /\/name\/(.*?)\/\?ref/
      const reg2 = /\/character\/(.*?)\/\?ref/
      const match1 = photo.nmId.match(reg1)
      const match2 = photo.chId.match(reg2)
      photo.nmId = match1[1]
      photo.chId = match2[1]
      return photo
    }),
    R.filter(photo => {
      return photo.nmId && photo.chId && photo.name && photo.playedBy
    })
  )
  photos = fn(photos)
  writeFileSync('./imdb.json', JSON.stringify(photos, null, 2), 'utf-8')
}

const fetchIMDBProfile = async(url) => {
  const options = {
    uri: url,
    transform: body => {
      return cheerio.load(body)
    }
  }
  const $ = await rp(options)
  let src = $('a[name=headshot] img').attr('src')
  if (src) {
    // 以v1为分割线。删除后面的URL部分
    src = src.split('V1').shift()
    src += 'V1.jpg'
  }
  return src
}

export const getIMDBProfile = async() => {
  const charactersData = require(resolve(__dirname, '../../check.json'))
  for (let i = 0; i < charactersData.length; i++) {
    if (!charactersData[i].profile) {
      const url = `http://www.imdb.com/character/${charactersData[i].chId}/`
      const src = await fetchIMDBProfile(url)
      console.log(`正在爬${charactersData[i].name}的数据`)
      charactersData[i].profile = src
      await sleep(500)
      console.log(`爬到${charactersData[i].profile}`)
      writeFileSync('./IMDBProfile.json', JSON.stringify(charactersData, null, 2), 'utf-8')
    }
  }
  return charactersData
}

export const checkIMDBProfile = () => {
  const IMDBProfile = require(resolve(__dirname, '../../IMDBProfile.json'))
  let newArr = []
  IMDBProfile.forEach((item) => {
    if (item.profile) {
      newArr.push(item)
    }
  })
  writeFileSync('./checked.json', JSON.stringify(newArr, null, 2), 'utf-8')
  return newArr
}

export const fetchIMDBImages = async(url) => {
  const options = {
    uri: url,
    transform: body => {
      return cheerio.load(body)
    }
  }
  const $ = await rp(options)
  let images = []
  $('div.media_index_thumb_list a img').each(function () {
    let src = $(this).attr('src')
    if (src) {
      src = src.split('V1').shift()
      src += 'V1.jpg'
      images.push(src)
    }
  })
  return images
}

export const getIMDBImages = async() => {
  const checkedData = require(resolve(__dirname, '../../checked.json'))
  for (let i = 0; i < checkedData.length; i++) {
    const url = `http://www.imdb.com/character/${checkedData[i].chId}/mediaindex`
    console.log(`正在爬${checkedData[i].name}的剧照`)
    const images = await fetchIMDBImages(url)
    console.log(`爬到${images.length}张剧照`)
    checkedData[i].images = images
    await sleep(500)
    writeFileSync('./fullCharacters.json', JSON.stringify(checkedData, null, 2), 'utf-8')
  }
  return checkedData
}

getIMDBImages()

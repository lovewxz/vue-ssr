import { resolve } from 'path'
import { writeFileSync } from 'fs'
import R from 'ramda'
import { find } from 'lodash'

const imdbData = require(resolve(__dirname, '../../imdb.json'))
const charactersData = require(resolve(__dirname, '../../characters.json'))

// http://lodashjs.com/docs/#_findcollection-predicate_identity-thisarg

const findNameInApi = (item) => {
  return find(charactersData, {
    name: item.name
  })
}

const findPlayedByInApi = (item) => {
  return find(charactersData, (i) => {
    return i.playedBy.includes(item.playedBy)
  })
}

const validData = R.filter(
  i => findNameInApi(i) && findPlayedByInApi(i)
)

const IMDB = validData(imdbData)
console.log(IMDB.length)
writeFileSync('./check.json', JSON.stringify(IMDB, null, 2), 'utf-8')

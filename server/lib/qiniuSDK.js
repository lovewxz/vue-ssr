import qiniu from 'qiniu'
import config from '../config'

const bucket = 'vuessr'
const pipeline = ''

let fops = 'imageMogr2/format/webp'

export default class QiniuSDK {
  constructor() {
    this.AK = config.qiniu.AK
    this.SK = config.qiniu.SK
    this.bucket = bucket
    this.bucketManager = this.bucketManagerMethod()
    this.mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK)
  }
  bucketManagerMethod() {
    const config = new qiniu.conf.Config()
    config.zone = qiniu.zone.Zone_z2
    return new qiniu.rs.BucketManager(this.mac, config)
  }
  /**
   * 对图片进行一些预处理
   * @param  {String} name     [mybucket:my.jpg]
   * @param  {String} filename [文件名称]
   * @return {[type]}          [description]
   */
  _policy(name, filename) {
    let encoded = new Buffer(`${bucket}:webp/${filename}`).toString('base64')
    let persist
    if (pipeline !== '') {
      persist = {
        persistentOps: `${fops}|saveas/${encoded}`,
        persistentPipeline: pipeline
      }
    } else {
      persist = {}
    }
    return Object.assign({}, persist, {
      scope: name,
      deadline: new Date().getTime() + 600
    })
  }
  // 获取上传的token凭证
  uptoken(filename) {
    let key = `${bucket}:${filename}`
    let putPolicy = new qiniu.rs.PutPolicy(this._policy(key,filename))
    let upToken =  putPolicy.uploadToken(this.mac)
    return {
      upToken,
      key,
      supportWebp: pipeline !== ''
    }
  }
  // 上传网络图片到七牛服务器上
  fetchImage(url, key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.fetch(url, this.bucket, key, (err, respBody) => {
        if (err) {
          reject(err)
        } else {
          console.log(respBody)
          resolve(respBody)
        }
      })
    })
  }
}

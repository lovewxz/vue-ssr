import qiniu from 'qiniu'
import config from '../config'

const bucket = 'vuessr'

export default class QiniuSDK {
  constructor() {
    this.AK = config.qiniu.AK
    this.SK = config.qiniu.SK
    this.bucket = bucket
    this.bucketManager = this.bucketManagerMethod()
  }
  bucketManagerMethod() {
    const mac = new qiniu.auth.digest.Mac(this.AK, this.SK)
    const config = new qiniu.conf.Config()
    config.zone = qiniu.zone.Zone_z2
    return new qiniu.rs.BucketManager(mac, config)
  }
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

import mongoose from 'mongoose'
const Schema = mongoose.Schema
import bcrypt from 'bcrypt'

const saltRounds = 10
const MAX_LOGINATTEMPTS = 5
const LOCKED_TIME = 2 * 60 * 60 * 1000

const UserSchema = new Schema({
  role: {
    type: String,
    default: 'user'
  },
  token: String,
  openid: [String],
  unionid: String,
  nickname: String,
  address: String,
  province: String,
  country: String,
  city: String,
  sex: String,
  email: String,
  password: String,
  hashed_password: String,
  headimgurl: String,
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// 判断用户是否被锁定
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.updatedAt = Date.now()
  }
  next()
})

// 对密码进行加盐
UserSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (error, hash) {
      if (error) return next(error)
      user.password = hash
      next()
    })
  })
})

UserSchema.methods = {
  comparePassWord: function (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch)
        else reject(err)
      })
    })
  },
  incLoginAttempts: function (user) {
    const that = this
    return new Promise((resolve, reject) => {
      let updates
      if (that.lockUntil && !that.isLocked) {
        updates = {
          $set: {
            loginAttempts: 1
          },
          $unset: {
            lockUntil: 1
          }
        }
        user.update(updates, function (err) {
          if (err) reject(err)
          else resolve(true)
        })
      } else {
        updates = {
          $inc: {
            loginAttempts: 1
          }
        }
        if (that.loginAttempts >= MAX_LOGINATTEMPTS && !that.isLocked) {
          updates.$set = {
            lockUntil: Date.now() + LOCKED_TIME
          }
        }
        that.update(updates, function (err) {
          if (err) reject(err)
          else resolve(true)
        })
      }
    })
  }
}

mongoose.model('User', UserSchema)

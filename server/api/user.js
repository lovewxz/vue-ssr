import mongoose from 'mongoose'
import createToken from '../lib/token'
const User = mongoose.model('User')

export async function login(email, password) {
  let match = false
  let user
  try {
    user = await User.findOne({
      email: email
    }).exec()
    if (user) {
      match = await user.comparePassWord(password, user.password)
      user.token = createToken(user._id)
      await user.save()
    }
  } catch (e) {
    throw new Error(e)
  }
  return {
    match,
    user
  }
}

import mongoose from 'mongoose'

const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed

const WikiHouseSchema = new Schema({
  wikiId: Number,
  name: String,
  cname: String,
  intro: [
    String
  ],
  words: String,
  cover: String,
  swornMembers: [{
    character: {
      type: String,
      ref: 'WikiCharacter'
    },
    text: String
  }],
  sections: Mixed,
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

WikiHouseSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

const WikiHouse = mongoose.model('WikiHouse', WikiHouseSchema)

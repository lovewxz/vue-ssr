import mongoose from 'mongoose'
const { Schema } = mongoose

const ProductSchema = new Schema({
  price: String,
  title: String,
  intro: String,
  images: [
    String
  ],
  parameters: [
    {
      key: String,
      value: String
    }
  ]
})

const Product = mongoose.model('Product', ProductSchema)

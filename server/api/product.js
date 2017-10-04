import mongoose from 'mongoose'

const Product = mongoose.model('Product')

export async function getProducts(limit = 50) {
  const product = await Product.find({}).limit(Number(limit)).exec()
  return product
}

export async function getProduct(_id) {
  const product = await Product.findOne({_id:_id}).exec()
  return product
}

export async function save(product) {
  product = new Product(product)
  product = await product.save()
  return product
}

export async function update(product) {
  product = await product.save()
  return product
}


export async function del(product) {
  await product.remove()
  return true
}

const asyncHandler = require('express-async-handler')
const { create } = require('../models/productModel')
const Product = require('../models/productModel')

// @Route    GET /api/products
// @Desc     Fetch all products
// @Access   Public
exports.getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {}

  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1

  const count = await Product.countDocuments({ ...keyword })

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

  res.json({ products, page, pages: Math.ceil(count / pageSize) })
})

// @Route    GET /api/products/:id
// @Desc     Fetch single product
// @Access   Public
exports.getProductsById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  return res.json(product)
})

// @Route    DELETE /api/products/:id
// @Desc     Delete a product
// @Access   Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  await product.remove()
  res.json({ message: 'Product removed' })
})

// @Route    POST /api/products
// @Desc     Create a product
// @Access   Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// @Route    PUT /api/products/:id
// @Desc     Update a product
// @Access   Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  product.name = name
  product.price = price
  product.description = description
  product.image = image
  product.brand = brand
  product.category = category
  product.countInStock = countInStock

  const updatedProduct = await product.save()
  res.json(updatedProduct)
})

// @Route    POST /api/products/:id/reviews
// @Desc     Create new review
// @Access   Private
exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString())

  if (alreadyReviewed) {
    res.status(400)
    throw new Error('Product already reviewed')
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  product.reviews.push(review)
  product.numReviews = product.reviews.length

  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

  await product.save()
  res.status(201).json({ message: 'Review added' })
})

// @Route    GET /api/products/top
// @Desc     Get top rated products
// @Access   Public
exports.getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)
  res.json(products)
})

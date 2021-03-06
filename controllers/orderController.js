const asyncHandler = require('express-async-handler')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const mail = require('../config/mail')
const receiptTemplate = require('../templates/receiptTemplate')
const User = require('../models/userModel')

// @Route    POST /api/orders
// @Desc     Create new order
// @Access   Private
exports.addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    parent,
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    parent,
  })

  // Update product quantity
  const updateProductQuantity = orderItems.map(async (orderItem) => {
    const product = await Product.findById(orderItem.product)
    product.countInStock = product.countInStock - orderItem.qty
    return product.save()
  })
  await Promise.all(updateProductQuantity)

  const createdOrder = await order.save()

  res.status(201).json(createdOrder)
})

// @Route    GET /api/orders/:id
// @Desc     Get order by ID
// @Access   Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')

  if (order) return res.json(order)

  res.status(401)
  throw new Error('Order not found')
})

// @Route    PUT /api/orders/:id/pay
// @Desc     Update order to paid
// @Access   Private
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(401)
    throw new Error('Order not found')
  }

  order.isPaid = true
  order.paidAt = Date.now()

  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
  }

  const updatedOrder = await order.save()

  let template = receiptTemplate(updatedOrder)

  await mail.sendMail({
    to: req.user.email,
    subject: `Your order (${updatedOrder._id}) successfully paid!`,
    html: template,
  })

  res.json(updatedOrder)
})

// @Route    PUT /api/orders/:id/deliver
// @Desc     Update order to delivered
// @Access   Private/Admin
exports.updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(401)
    throw new Error('Order not found')
  }

  order.isDelivered = true
  order.deliveredAt = Date.now()

  // Add can Review Product
  const user = await User.findById(order.user)
  const oldCanReviewProduct = user.canReviewProduct
  const newCanReviewProduct = []
  const orderItems = order.orderItems

  for (const item of orderItems) {
    newCanReviewProduct.push(String(item.product))
  }

  let tempArr = oldCanReviewProduct.concat(newCanReviewProduct)
  user.canReviewProduct = [...new Set(tempArr)]

  await user.save()
  const updatedOrder = await order.save()
  res.json(updatedOrder)
})

// @Route    PUT /api/orders/:id/shipping
// @Desc     Update shipping information
// @Access   Private/Admin
exports.updateShippingInfo = asyncHandler(async (req, res) => {
  const { shippingInfo } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(401)
    throw new Error('Order not found')
  }

  // Add Shipping Information
  order.shippingAddress = shippingInfo

  const updatedOrder = await order.save()
  res.json(updatedOrder)
})

// @Route    PUT /api/orders/:id/paymentMethod
// @Desc     Update Payment Method
// @Access   Private/Admin
exports.updatePaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(401)
    throw new Error('Order not found')
  }

  // Add Payment Method
  order.paymentMethod = paymentMethod

  const updatedOrder = await order.save()
  res.json(updatedOrder)
})

// @Route    GET /api/orders/me
// @Desc     Get logged in user orders
// @Access   Private
exports.getMyOrder = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
  res.json(orders)
})

// @Route    GET /api/orders/child
// @Desc     Get logged in user's childs orders
// @Access   Private
exports.getChildOrder = asyncHandler(async (req, res) => {
  const orders = await Order.find({ parent: req.user._id }).populate('user', 'id name email')
  res.json(orders)
})

// @Route    GET /api/orders
// @Desc     Get all orders
// @Access   Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name')
  res.json(orders)
})

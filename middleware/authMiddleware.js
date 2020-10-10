const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

exports.protect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, 'abc123')
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error('Invalid token')
    }
  }
  if (!token) {
    res.status(401)
    throw new Error('No token')
  }
})

exports.admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()

  res.status(401)
  throw new Error('Not authorized as an Admin')
})

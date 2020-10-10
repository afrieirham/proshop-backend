const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const generateToken = require('../utils/generateToken')

// @Route    POST /api/users/login
// @Desc     Auth user & get token
// @Access   Public
exports.authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email && !password) {
    res.status(400)
    throw new Error('Email or password cannot be empty')
  }

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or passsword')
  }
})

// @Route    GET /api/users/profile
// @Desc     Get user profile
// @Access   Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401)
    throw new Error('User not found')
  }

  const user = await User.findById(req.user._id)
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  })
})

// @Route    PUT /api/users/profile
// @Desc     Update user profile
// @Access   Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401)
    throw new Error('User not found')
  }

  const user = await User.findById(req.user.id)
  user.name = req.body.name || user.name
  user.email = req.body.email || user.email

  if (req.body.password) {
    user.password = req.body.password
  }

  const updatedUser = await user.save()

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    token: generateToken(updatedUser._id),
  })
})

// @Route    POST /api/users
// @Desc     Register new user
// @Access   Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExist = await User.findOne({ email })

  if (userExist) {
    res.status(400)
    throw new Error('User already exist')
  }

  const user = await User.create({ name, email, password })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @Route    GET /api/users
// @Desc     Get all user
// @Access   Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// @Route    DELETE /api/users/:id
// @Desc     Delete user
// @Access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  await user.remove()
  return res.json({ message: 'User removed' })
})

// @Route    GET /api/users/:id
// @Desc     Get user by ID
// @Access   Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (user) return res.json(user)

  res.status(404)
  throw new Error('User not found')
})

// @Route    PUT /api/users/:id
// @Desc     Update user profile by ID
// @Access   Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  user.name = req.body.name || user.name
  user.email = req.body.email || user.email
  user.isAdmin = req.body.isAdmin

  const updatedUser = await user.save()

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
  })
})
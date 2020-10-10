const mongoose = require('mongoose')
const colors = require('colors')

const users = require('./data/users')
const products = require('./data/products')

const User = require('./models/userModel')
const Product = require('./models/productModel')
const Order = require('./models/orderModel')

const connectDB = require('./config/db')

connectDB()

const importData = async () => {
  try {
    // Clear DB
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()

    // Seed users
    const createdUsers = await User.insertMany(users)
    const admin = createdUsers[0]._id

    // Map products to admin
    const sampleProducts = await products.map((product) => {
      return { ...product, user: admin }
    })

    // Seed products
    await Product.insertMany(sampleProducts)

    console.log('Database seeded'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    // Clear DB
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()

    console.log('Database destroyed'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}

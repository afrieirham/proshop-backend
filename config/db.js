const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

const URI = process.env.MONGO_DB_URI

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`.bgCyan.black)
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold)
    process.exit(1)
  }
}

module.exports = connectDB

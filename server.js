const express = require('express')
const cors = require('cors')
const colors = require('colors')
const path = require('path')
const morgan = require('morgan')

const connectDB = require('./config/db')
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const orderRoutes = require('./routes/orderRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

connectDB()

const app = express()
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send('API is running...'))
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.get('/api/config/paypal', (req, res) => res.send(require('./config/paypal')))

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server running on port ${PORT}`.cyan.bold))

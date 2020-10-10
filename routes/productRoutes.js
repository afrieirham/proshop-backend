const router = require('express').Router()
const {
  getProducts,
  getProductsById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
} = require('../controllers/productController')
const { protect, admin } = require('../middleware/authMiddleware')

router.get('/', getProducts)
router.post('/', protect, admin, createProduct)
router.get('/top', getTopProducts)
router.post('/:id/reviews', protect, createProductReview)
router.get('/:id', getProductsById)
router.put('/:id', protect, admin, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

module.exports = router

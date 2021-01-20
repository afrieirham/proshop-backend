const router = require('express').Router()
const {
  getOrderById,
  getMyOrder,
  getChildOrder,
  getOrders,
  addOrderItems,
  updateOrderToPaid,
  updateOrderToDelivered,
} = require('../controllers/orderController')
const { protect, admin } = require('../middleware/authMiddleware')

router.get('/me', protect, getMyOrder)
router.get('/child', protect, getChildOrder)
router.put('/:id/pay', protect, updateOrderToPaid)
router.put('/:id/deliver', protect, admin, updateOrderToDelivered)
router.get('/:id', getOrderById)
router.get('/', protect, admin, getOrders)
router.post('/', protect, addOrderItems)

module.exports = router

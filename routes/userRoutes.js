const router = require('express').Router()
const {
  authUser,
  getUserProfile,
  registerUser,
  registerChildUser,
  updateUserProfile,
  validateToken,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
} = require('../controllers/userController')

const { protect, admin } = require('../middleware/authMiddleware')

router.get('/', protect, admin, getUsers)
router.get('/register/:token', validateToken)
router.post('/', registerUser)
router.post('/child', protect, registerChildUser)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.post('/login', authUser)
router.get('/:id', protect, admin, getUserById)
router.put('/:id', protect, admin, updateUser)
router.delete('/:id', protect, admin, deleteUser)

module.exports = router

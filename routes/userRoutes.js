const router = require('express').Router()
const {
  authUser,
  getUserProfile,
  getChildren,
  registerUser,
  registerChildUser,
  inviteChild,
  updateUserProfile,
  validateToken,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
} = require('../controllers/userController')

const { protect, admin } = require('../middleware/authMiddleware')

router.get('/', protect, admin, getUsers)
router.get('/children', protect, getChildren)
router.get('/register/:token', validateToken)
router.post('/', registerUser)
router.post('/register', registerChildUser)
router.post('/child', protect, inviteChild)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.post('/login', authUser)
router.get('/:id', protect, admin, getUserById)
router.put('/:id', protect, admin, updateUser)
router.delete('/:id', protect, admin, deleteUser)

module.exports = router

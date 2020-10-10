const router = require('express').Router()
const {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
} = require('../controllers/userController')

const { protect, admin } = require('../middleware/authMiddleware')

router.get('/', protect, admin, getUsers)
router.post('/', registerUser)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.post('/login', authUser)
router.get('/:id', protect, admin, getUserById)
router.put('/:id', protect, admin, updateUser)
router.delete('/:id', protect, admin, deleteUser)

module.exports = router

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inviteToken: {
      type: String,
    },
    canReviewProduct: [{ type: String }]
  },
  { timestamps: true }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(5)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.toJSON = function () {
  const rawUser = this.toObject()

  // Remove private info before sending
  const { password, __v, ...user } = rawUser
  return user
}

const User = mongoose.model('User', userSchema)
module.exports = User

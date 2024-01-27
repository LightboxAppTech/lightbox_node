const mongoose = require('mongoose')
const { Boolean, Number, String } = mongoose.Schema.Types

const VerificationSchema = new mongoose.Schema(
  {
    code: { type: Number, default: null },
    validUpTo: { type: Number, default: null },
  },
  { _id: false }
)

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, minlength: 8, maxlength: 100, unique: true, required: true },
    password: { type: String, minlength: 8, maxlength: 100, required: true },
    isVerified: { type: Boolean, default: false },
    emailVerification: { type: VerificationSchema },
    forgotPasswordVerification: { type: VerificationSchema },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)

const mongoose = require('mongoose')
const { Boolean, Number, String } = mongoose.Schema.Types

const VerificationSchema = new mongoose.Schema(
  {
    code: { type: Number, required: true },
    validUpTo: { type: Number, required: true },
  },
  { _id: false }
)

const defaultVerification = { code: null, validUpTo: null }

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, minlength: 8, maxlength: 100, unique: true, required: true },
    password: { type: String, minlength: 8, maxlength: 100, required: true },
    isVerified: { type: Boolean, default: false },
    emailVerification: { type: VerificationSchema, default: defaultVerification },
    forgotPasswordVerification: { type: VerificationSchema, default: defaultVerification },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)

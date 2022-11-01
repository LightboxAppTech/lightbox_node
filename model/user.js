const mongoose = require('mongoose')

// const ValidationCode = new mongoose.Schema(
//   {
//     code: { type: mongoose.Schema.Types.Number },
//     validUpTo: { type: mongoose.Schema.Types.Date },
//   },
//   { _id: false, id: false }
// );

const userSchema = new mongoose.Schema(
  {
    email: {
      type: mongoose.Schema.Types.String,
      require: true,
      min: 6,
      max: 100,
      unique: true,
    },
    password: {
      type: mongoose.Schema.Types.String,
      require: true,
      min: 8,
      max: 100,
    },
    isVerified: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
      required: false,
    },
    emailVerification: {
      code: { type: mongoose.Schema.Types.Number, default: '' },
      validUpTo: { type: mongoose.Schema.Types.Number, default: '' },
      required: false,
    },
    forgotPasswordVerification: {
      code: { type: mongoose.Schema.Types.Number, default: '' },
      validUpTo: { type: mongoose.Schema.Types.Number, default: '' },
      required: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

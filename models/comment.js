const mongoose = require('mongoose')
const { ObjectId, String } = mongoose.Schema.Types

const comment = new mongoose.Schema({
  comment_text: { type: String, required: true },
  commentor_name: { type: String, required: true },
  commentor: { type: ObjectId, ref: 'User', required: true },
  comment_date: { type: String, required: true },
  thumbnail_pic: { type: String, default: null },
})

module.exports = mongoose.model('Comment', comment)

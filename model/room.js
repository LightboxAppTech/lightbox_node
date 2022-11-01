const mongoose = require('mongoose')

const chatroomSchema = new mongoose.Schema(
  {
    room_name: {
      type: String,
      required: true,
    },
    project_id: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    messages: {
      type: mongoose.Schema.Types.Array,
      default: [],
    },
    is_active: {
      type: mongoose.Schema.Types.Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Room', chatroomSchema)

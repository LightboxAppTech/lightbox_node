const mongoose = require('mongoose')
const { Boolean, ObjectId, String } = mongoose.Schema.Types

const ChatRoomSchema = new mongoose.Schema(
  {
    room_name: { type: String, required: true },
    project_id: { type: ObjectId, required: true },
    messages: { type: [String], default: [] },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Room', ChatRoomSchema)

const mongoose = require('mongoose')
const { Boolean, ObjectId, String } = mongoose.Schema.Types

const NotificationSchema = new mongoose.Schema(
  {
    receiver: { type: ObjectId, ref: 'User', required: true },
    thumbnail_pic: { type: String, default: null },
    message: { type: String, required: true },
    is_unread: { type: Boolean, default: true, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
)

const UserNotificationSchema = new mongoose.Schema(
  {
    notifications: [NotificationSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', NotificationSchema)
// module.exports = mongoose.model("Notification", UserNotificationSchema),

const mongoose = require('mongoose')

const notification = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
    thumbnail_pic: { type: mongoose.Schema.Types.String, default: '' },
    message: { type: mongoose.Schema.Types.String, required: true },
    is_unread: {
      type: mongoose.Schema.Types.Boolean,
      default: true,
      required: true,
    },
    url: { type: mongoose.Schema.Types.String, required: true },
  },
  { timestamps: true }
)

const notificatioSchema = new mongoose.Schema(
  {
    notifications: [notification],
  },
  { timestamps: true }
)

module.exports = {
  // Notifications: mongoose.model("notifications", notificatioSchema),
  Notification: mongoose.model('notifications', notification),
}

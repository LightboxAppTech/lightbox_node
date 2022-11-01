const { Notification } = require('../model/notification')

module.exports = (uid, notification) => {
  return new Promise((resolve, reject) => {
    try {
      Notification.findByIdAndUpdate(
        { _id: uid },
        {
          $push: { notifications: notification },
        },
        { upsert: true }
      )
        .then((data) => {
          resolve(data)
        })
        .catch((e) => reject(e))
    } catch (e) {
      reject(e)
    }
  })
}

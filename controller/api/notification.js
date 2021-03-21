const sessionUser = require("./utils/get/user");
const { Notification } = require("../../model/notification");

const getNotifications = async (req, res) => {
  try {
    const user = await sessionUser(req, res);
    let notifs = await Notification.find({
      receiver: user._id,
      is_unread: true,
    })
      .lean(true)
      .sort({ createdAt: -1 });
    if (notifs.length < 25) {
      let limit = 25 - notifs.length;
      let readNotifs = await Notification.find({
        receiver: user._id,
        is_unread: false,
      })
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(true);
      notifs.push(...readNotifs);
    }
    res.json(notifs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notificationId = req.body._id;
    const receiver = req.body.receiver;

    const notification = await Notification.findById(notificationId);

    if (
      notificationId === undefined ||
      notificationId === "" ||
      receiver === "" ||
      receiver === undefined ||
      notification === null
    ) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const user = await sessionUser(req, res);

    if (user._id != receiver) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Notification.updateOne(
      { _id: notificationId, receiver: receiver },
      {
        $set: { is_unread: false },
      },
      (err, data) => {
        if (err) {
          throw err;
        }
        res.json({ message: "marked as read" });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const user = await sessionUser(req, res);

    Notification.updateMany(
      { receiver: user._id },
      {
        $set: { is_unread: false },
      },
      (err, data) => {
        if (err) {
          throw err;
        }
        res.json({ message: "All Notifications are marked as read" });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = {
  fetchNotification: getNotifications,
  markAsRead: markAsRead,
  markAllAsRead: markAllAsRead,
};

const Notification = require("../models/Notification");
const User = require("../models/User");

// Send a notification
// route POST /api/notifications
// access Private

/* const sendNotification = async (req, res) => {
  try {
    const { receiver, type, post, comment, message } = req.body;
    const sender = req.user.id;

    if (sender === receiver) return res.status(400).json({ message: "You cannot notify yourself" });

    const newNotification = new Notification({ sender, receiver, type, post, comment, message });
    await newNotification.save();

    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; */

//  Get user notifications
// route GET /api/notifications
// access Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .populate("sender", "name profilePicture")
      .populate("post","text")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Mark notification as read
// route PATCH /api/notifications/:id
// access Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Delete a notification
// route DELETE /api/notifications/:id
// access Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    await notification.deleteOne();
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete all notifications
// route DELETE /api/notifications
// access Private

const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ receiver: req.user.id });
    res.json({ message: "All notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get unread notification count' });
  }
};
module.exports = {
  getUnreadNotificationCount,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
};

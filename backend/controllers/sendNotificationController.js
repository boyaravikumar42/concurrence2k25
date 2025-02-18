const Notification = require("../models/Notification");
const User = require('../models/User');

const sendNotification = async ({ sender, receiver, type, post, comment, message }) => {
  if (sender.toString() === receiver.toString()) return; // Avoid self-notifications

  try {
    const newNotification = new Notification({ sender, receiver, type, post, comment, message });
    await newNotification.save();
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};







module.exports = {
  sendNotification  
};


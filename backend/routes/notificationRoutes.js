const express = require("express");
const { 
  /* sendNotification,  */
  getUserNotifications, 
  markAsRead, 
  deleteNotification, 
  deleteAllNotifications, 
  getUnreadNotificationCount
} = require("../controllers/notificationController");

const { protect } = require("../middlewares/authMiddleware");


const router = express.Router();

router.get("/unread-count", protect, getUnreadNotificationCount);
/* router.post("/", protect, sendNotification); */
router.get("/", protect, getUserNotifications);
router.patch("/:id", protect, markAsRead);
router.delete("/", protect, deleteAllNotifications);
router.delete("/:id", protect, deleteNotification);



module.exports = router;

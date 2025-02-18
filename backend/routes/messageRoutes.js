const express = require("express");
const { sendMessage, getMessages, resetUnreadCount } = require("../controllers/messageController");
const {protect} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);
router.put("/reset-unread/:chatId",protect, resetUnreadCount);


router.get("/:chatId",protect, getMessages);
module.exports = router;

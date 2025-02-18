const express = require("express");
const { accessChat } = require("../controllers/chatController");
const {protect}=require('../middlewares/authMiddleware')

const router = express.Router();

router.post("/", protect, accessChat); // Create/Get chat when user clicks

module.exports = router;

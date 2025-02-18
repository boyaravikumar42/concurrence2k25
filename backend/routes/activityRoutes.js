const express = require("express");
const { getUserActivityLogs } = require("../controllers/activityController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/activity", protect, getUserActivityLogs); // Fetch user's activity logs

module.exports = router;  
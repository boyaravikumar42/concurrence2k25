const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { searchPlatform } = require("../controllers/SearchController");

const router = express.Router();


router.get("/", protect, searchPlatform);


module.exports = router;
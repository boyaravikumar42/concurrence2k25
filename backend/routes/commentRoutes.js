const express = require("express");
const {  addComment,   getCommentsForPost } = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();


router.post("/post/:postId", protect, addComment);
router.get("/post/:postId", protect, getCommentsForPost);



module.exports = router;

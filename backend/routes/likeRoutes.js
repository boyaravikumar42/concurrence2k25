const express = require("express");
const { 
  likePost,  
  getPostLikes,  
  checkLikeStatusOfPost
} = require("../controllers/likeController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/post/:postId", protect, likePost);
router.get("/post/:postId", protect, getPostLikes);//users who liked for post
router.get("/check-like/:postId",protect,checkLikeStatusOfPost)


module.exports = router;

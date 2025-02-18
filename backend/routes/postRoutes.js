const express = require("express");
const { 
  createPost, 
  getAllPosts, 
  getPostById, 
 /*  deletePost, */ 
  savePost, 
  sharePost,
 
  getUserPosts,
  getSavedPosts,
  checkSavedStatus,
} = require("../controllers/postController");
/* const upload =require("../middlewares/multer");  */
const { protect } = require("../middlewares/authMiddleware");
const { uploadPost } = require("../middlewares/multer"); 
const router = express.Router();

router.post("/", protect, uploadPost.array("media", 10), createPost);
router.get("/", protect, getAllPosts);//
router.get("/:id", protect, getPostById);
router.get("/user", protect, getUserPosts);
/* router.delete("/:id", protect, deletePost); */
router.post("/save/:id", protect, savePost);//
router.post("/share/:postId",protect,sharePost);//
router.get("/user/saved-posts", protect, getSavedPosts);//
router.get('/check-save/:postId',protect,checkSavedStatus)
module.exports = router;

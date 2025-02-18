const Like = require("../models/Like");
const Post = require("../models/Post");
const { logActivity } = require("./activityController");
const{ sendNotification} = require("./sendNotificationController");


// Like or unlike a post
// route POST /api/likes/post/:postId
// access Private

const likePost = async (req, res) => {
  try {
    /* console.log("entered",req.params) */
    const { postId } = req.params;
    const userId = req.user.id;
     
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (existingLike) {
      await existingLike.deleteOne();
      post.likes.pull(userId);
      await post.save();
       await sendNotification({
        sender: req.user.id,
        receiver: post.user,
        type: "unlike",
        post: post._id,
      });
      await logActivity(req.user.id, "unliked_post", post._id); 
      return res.json({ message: "Post unliked",likes:post.likes });
    } else {
      const newLike = new Like({ user: userId, post: postId });
      await newLike.save();
      post.likes.push(userId);
      await post.save();
       // Notify the post owner
      await sendNotification({
        sender: req.user.id,
        receiver: post.user,
        type: "like",
        post: post._id,
      });
      await logActivity(req.user.id, "liked_post", post._id);
      return res.json({ message: "Post liked",likes:post.likes });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Get users who liked a post
// route GET /api/likes/post/:postId
// access Private

const getPostLikes = async (req, res) => {
  console.log("Entered like function");

  try {
 
    const likes = await Like.find({ post: req.params.postId }).populate(
      "user",
      "name profilePicture"
    );
    res.json(likes);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const checkLikeStatusOfPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(req.user.id);

    res.json({ isLiked });
  } catch (error) {
    res.status(500).json({ message: "Error checking like status", error: error.message });
  }
};

module.exports = {
  likePost,
  getPostLikes,
  checkLikeStatusOfPost
};

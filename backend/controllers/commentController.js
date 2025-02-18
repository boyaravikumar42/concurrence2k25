const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const { logActivity } = require("./activityController");
const {sendNotification} = require("./sendNotificationController");

//  Add a comment to a post
// route POST /api/comments/post/:id
// access Private
const addComment = async (req, res) => {
  try {
    const {  text } = req.body;
     const postId=req.params.postId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = new Comment({ user: req.user.id, post: postId, text });
    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();
    
    // Notify the post owner
    await sendNotification({
      sender: req.user.id,
      receiver: post.user._id,
      type: "comment",
      post:post._id
    });

    await logActivity(req.user.id, "comment_posted",post._id);
    res.status(201).json({newComment,comments:post.comments});
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Fetch all comments for a post
// route GET /api/comments/post/:postId
// access Private
const getCommentsForPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


module.exports = {
  addComment,
 
  getCommentsForPost,
};

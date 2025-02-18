const User = require("../models/User");
const Post = require("../models/Post");



const getRankedUsers = async (req, res) => {
  try {
    // Define engagement weights
    const likeWeight = 1;
    const commentWeight = 2;
    const shareWeight = 3;
    const postWeight = 5;

    // Fetch all users and their engagement metrics
    const users = await User.find().lean();

    const rankedUsers = await Promise.all(
      users.map(async (user) => {
        // Count total likes, comments, shares, and posts for each user
        const posts = await Post.find({ user: user._id });
        const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
        const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
        const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
        const totalPosts = posts.length;

        // Calculate engagement score
        const engagementScore =
          totalLikes * likeWeight +
          totalComments * commentWeight +
          totalShares * shareWeight +
          totalPosts * postWeight;

        return {
          userId: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
          engagementScore,
        };
      })
    );

    // Sort users by engagement score in descending order
    rankedUsers.sort((a, b) => b.engagementScore - a.engagementScore);

    res.status(200).json(rankedUsers);
  } catch (error) {
    console.error("Error fetching ranked users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getRankedUsers };

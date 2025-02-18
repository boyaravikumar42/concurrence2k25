const User = require("../models/User");
const Post = require("../models/Post");
const { logActivity } = require("./activityController");

const searchPlatform = async (req, res) => {
  try {
    const { query, type = "all", page = 1, limit = 10 } = req.query;
    if (!query) return res.status(400).json({ message: "Search query required" });

    const searchRegex = new RegExp(query, "i"); // Case-insensitive search
    const skip = (page - 1) * limit;
    let results = [];

    // **Search Users** (by name, location, college, skills, badges)
    if (type === "all" || type === "user") {
      const users = await User.find(
        { 
          $or: [
            { name: searchRegex },
            { location: searchRegex },
            { skills: searchRegex },
            { badges: searchRegex },
            { achievements: searchRegex }
          ]
        },
        "name college department location profilePicture skills badges achievements"
      ).limit(limit).skip(skip);
      
      results.push(...users.map(user => ({
        type: "user",
        id: user._id,
        name: user.name,
        college: user.college,
        department: user.department,
        location: user.location,
        profilePicture: user.profilePicture,
        skills: user.skills,
        badges: user.badges,
        achievements: user.achievements
      })));
    }

    // **Search Posts** (by content, hashtags)
    if (type === "all" || type === "post") {
      const posts = await Post.find(
        { 
          $or: [
            { text: searchRegex },
            { hashtags: searchRegex }
          ]
        },
        "text media hashtags user likes comments createdAt"
      )
      .populate("user", "name profilePicture college")
      .limit(limit)
      .skip(skip);

      results.push(...posts.map(post => ({
        type: "post",
        id: post._id,
        text: post.text,
        hashtags: post.hashtags,
        media: post.media,
        user: {
          id: post.user._id,
          name: post.user.name,
          college: post.user.college,
          profilePicture: post.user.profilePicture || null,
        },
        likes: post.likes.length,
        comments: post.comments.length
      })));
    }

    // **Sort Results** (User-based ranking, recent posts first)
    results = results.sort((a, b) => {
      if (a.type === "user" && b.type === "post") return -1; // Users first
      if (b.type === "user" && a.type === "post") return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    await logActivity(req.user.id, "searched_something");
    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { searchPlatform };

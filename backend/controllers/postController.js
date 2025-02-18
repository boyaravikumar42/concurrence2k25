const Post =require("../models/Post");
const cloudinary = require("../config/cloudinary"); // Import Cloudinary helper
const User = require("../models/User");
const axios=require("axios");
const { logActivity } = require("./activityController");
//  Create a new post
// route POST /api/posts
// access Private
/* const createPost = async (req, res) => {
  try {
    const { text } = req.body; // Get post text
    const files = req.files; // Get uploaded media files
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    console.log("Received Text:", text);
    console.log("Received Media:", files);

    // Extract file paths from req.files
    const media = files.map((file) => file.path); // Store file paths in DB

    

    // Create a new post
    const newPost = new Post({
      user: req.user.id, 
      text,
      media,
      hashtags, 
    });
 
    await newPost.save();
    
    await logActivity(req.user.id, "created_post", newPost._id);
    res.status(201).json(newPost);

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; */

// CREATE POST WITH CLOUDINARY MEDIA UPLOAD
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
     const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log("Request received, checking files...");

    // Ensure files were uploaded
    if (!req.files || req.files.length === 0) {
      console.log("No media files uploaded");
      return res.status(400).json({ message: "No media files uploaded" });
    }

    console.log("Uploading files to Cloudinary...");

    // Upload each media file to Cloudinary
    const uploadedMedia = [];
    for (const file of req.files) {
      console.log("Uploading:", file.originalname);
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "posts",
        resource_type: "auto",
      });
      uploadedMedia.push(result.secure_url);
    }

    console.log("All files uploaded successfully:", uploadedMedia);
     let hashtags = [];

    // Generate hashtags using Gemini API
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ role: "user", parts: [{ text: `Generate 5 relevant hashtags for this text: "${text}". Provide only an array in response.` }] }]
        },
        { headers: { "Content-Type": "application/json" } }
      );
       
      // Extract response text
      const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      console.log("Raw AI Response:", reply);

      // Convert string response to a JavaScript array
      hashtags = JSON.parse(reply.replace(/```json|```/g, "").trim()); 
      console.log("hastags:",hashtags);
      // Ensure it's an array
      if (!Array.isArray(hashtags)) {
        hashtags = [];
      }
      
    } catch (error) {
      console.error("Error generating hashtags:", error.message);
    }
     hashtags.push("#rgmcet");
    // Create new post
    const newPost = new Post({
      user: userId,
      text,
      media: uploadedMedia, // Store Cloudinary URLs
      hashtags,
    });

    console.log("Saving new post...");
    await newPost.save();
    /* console.log("post",newPost); */
    await logActivity(req.user.id, "created_post",newPost._id);
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console("error occurred")
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Fetch all posts (College Feed)
// route GET /api/posts
// access Private
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    // Get previous post IDs from the frontend
    let previousPostIds = req.query.previousPosts ? req.query.previousPosts.split(",") : [];

    const user = await User.findById(userId).select("following followers");
    if (!user) return res.status(404).json({ message: "User not found" });

    let resultPosts = [];
    const includedPostIds = new Set(previousPostIds); // Prevent duplicates

    const addUniquePosts = (postsArray) => {
      for (const post of postsArray) {
        if (resultPosts.length >= limit) break;
        if (!includedPostIds.has(post._id.toString())) {
          includedPostIds.add(post._id.toString());
          resultPosts.push(post);
        }
      }
    };

    if (page === 1) {
      // Fetch 2 random posts from following users
      if (user.following.length > 0) {
        const followingPosts = await Post.aggregate([
          { $match: { user: { $in: user.following }, _id: { $nin: [...includedPostIds] } } },
          { $sample: { size: 2 } }
        ]);
        await Post.populate(followingPosts, { path: "user", select: "name profilePicture department year" });
        addUniquePosts(followingPosts);
      }

      // Fetch 2 random posts from followers
      if (user.followers.length > 0) {
        const followersPosts = await Post.aggregate([
          { $match: { user: { $in: user.followers }, _id: { $nin: [...includedPostIds] } } },
          { $sample: { size: 2 } }
        ]);
        await Post.populate(followersPosts, { path: "user", select: "name profilePicture department year" });
        addUniquePosts(followersPosts);
      }

      // Fetch 2 most recent posts
      if (resultPosts.length < limit) {
        const recentPosts = await Post.find({ _id: { $nin: [...includedPostIds] } })
          .populate("user", "name profilePicture department year")
          .sort({ createdAt: -1 })
          .limit(2);
        addUniquePosts(recentPosts);
      }

      // Fetch 4 random posts
      if (resultPosts.length < limit) {
        const randomPosts = await Post.aggregate([
          { $match: { _id: { $nin: [...includedPostIds] } } },
          { $sample: { size: 4 } }
        ]);
        await Post.populate(randomPosts, { path: "user", select: "name profilePicture department year" });
        addUniquePosts(randomPosts);
      }
    } else {
      // For Page 2+, fetch only random posts, avoiding previous ones
      const randomPosts = await Post.aggregate([
        { $match: { _id: { $nin: [...includedPostIds] } } },
        { $sample: { size: limit } }
      ]);
      await Post.populate(randomPosts, { path: "user", select: "name profilePicture department year" });
      addUniquePosts(randomPosts);
    }

    res.status(200).json({
      posts: resultPosts,
      previousPostIds: Array.from(includedPostIds), // Send back updated list of post IDs
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};





//  Get a single post
// route GET /api/posts/:id
// access Private
const getPostById = async (req, res) => {
  try {
     // Define backend URL

    const post = await Post.findById(req.params.id).populate("user", "name profilePicture department category");

    if (!post) return res.status(404).json({ message: "Post not found" });

    console.log("post:", post);
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Update a post
// route PUT /api/posts/:id
// access Private
/* const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    post.text = req.body.text || post.text;
    post.media = req.body.media || post.media;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; */


//getPostsByUser
const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a post
// route DELETE /api/posts/:id
// access Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const sharePost= async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.shares += 1; // Increment share count
    await post.save();
    await logActivity(req.user.id, "shared_post",post._id);
    res.json({ message: "Post shared successfully", shares: post.shares });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save a post (Bookmark)
// route POST /api/posts/save/:id
// access Private
const savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isSaved = post.savedBy.includes(req.user.id);
    /* console.log("saved",isSaved); */
    if (isSaved) {
      post.savedBy.pull(req.user.id);
      await logActivity(req.user.id, "unsaved_post",post._id);
    } else {
      post.savedBy.push(req.user.id);
      await logActivity(req.user.id, "saved_post",post._id);
    }
    
    await post.save();
    res.json({ message: isSaved ? "Removed from Saved" : "Saved" ,savedStatus:isSaved,savedBy:post.savedBy});
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//'/check-save/:postId'
const checkSavedStatus = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isSaved = post.savedBy.includes(req.user.id);

    res.json({ isSaved });
  } catch (error) {
    res.status(500).json({ message: "Error checking saved status", error: error.message });
  }
};



const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all posts where the user has saved them
    const savedPosts = await Post.find({ savedBy: userId })
      .populate("user", "name profilePicture") // Populate user details
      .sort({ createdAt: -1 }); // Sort by latest saved posts
 /* console.log("savedPosts:",savedPosts); */
    if (!savedPosts.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(savedPosts);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  /* deletePost, */
  sharePost,
  savePost,
  getSavedPosts,
  checkSavedStatus
};

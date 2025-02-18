const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const FollowRequest = require("../models/FollowRequest");
const Notification = require("../models/Notification");
const Like=require("../models/Like");
const Message=require('../models/Message')
const Chat=require('../models/Chat')
const Analytics = require("../models/Analytic");
const axios=require('axios');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { OAuth2Client } = require('google-auth-library');
const { param } = require("../routes/postRoutes");


const { logActivity } = require("./activityController");
/* const BING_API_KEY = "YOUR_BING_API_KEY"; */



const CLIENT_ID = '452038178344-tjjj23oaptmmqs93tr6vvpafpn54aect.apps.googleusercontent.com'; 
const client = new OAuth2Client(CLIENT_ID);

//  Register a new user
// route POST /api/users/register
// access Public
//  this is controller for the registeration of User 
const registerUser = async (req, res) => {
  try {
   
    const { name, collegeEmail, password } = req.body; //college name is not needed
    
     console.log(name,collegeEmail,password);
    const userExists = await User.findOne({ email:collegeEmail });
      console.log("user",userExists);
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, 
      email:collegeEmail,
       password: hashedPassword ,
       googleId: undefined  
});
    
    await newUser.save();
    /* console.log("saved"); */
    res.status(201).json({ message: "User registered successfully, please log in" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



//  Login user
// route POST /api/users/login
// access Public route to login by User
const loginUser = async (req, res) => {
  try {
    const { collegeEmail, password } = req.body; //i need to add a feature Mail-OTP
    const user = await User.findOne({ email:collegeEmail });

    if (!user || user.isDeactivated) return res.status(401).json({ message: "Invalid Credentials(User)" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "70d" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// google Authentication
// route /api/users/google

const  googleLoginUser= async (req, res) => {  
  try {
   const token = req.body.token; 
   /*  console.log("BackendToken"); */
    // 1. Verify the token with Google's API (directly in the route handler)
    // verifyIdToken() This is a function provided by the google-auth-library (which you installed with npm install google-auth-library). 
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    /* console.log(payload); */
    const userId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];
    /* const picture = payload['picture']; */
     const picture="https://res.cloudinary.com/dl5z0cqra/image/upload/v1739714958/profile_photos/1739714954269-account_circle.png.png"
    // 2. Check if user exists in the database (or create if needed)
    let user = await User.findOne({ googleId: userId });
    if (!user) {
      user = new User({ googleId: userId, email, name, profilePicture:picture });
      await user.save();
    }
    //console.log("USER :",user);
    // 3. Generate your own JWT
    const yourBackendToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '70d' }); 

    // 4. Send the token and user details back to the frontend
    res.json({ token: yourBackendToken, user });

  } 
  catch (error) {
    console.error("Google Login Error:", error);
    if (error.response) { // Check if it's an Axios-like error
      console.error("Google API Error Details:", error.response.data);
      res.status(error.response.status).json({
        message: error.response.data.error_description || 'Google login failed',
      });
    } else if (error.message && error.message.includes("invalid_grant")) {
        res.status(400).json({message: "Invalid or expired token"})
    }
    else {
      console.error("Other Error Details:", error);
      res.status(500).json({ message: 'Google login failed' });
    }
  }
}

//  Get user profile
// route GET /api/users/:id
// access Private  


// Get User Profile with Posts, Followers, Following & Total Likes

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    /* console.log("rp:",req.params);
    console.log("Fetching profile for ID:", id); */

    // Fetch user with only followers & following populated
    const user = await User.findById(id)
      .populate("followers", "_id") // Only get follower IDs
      .populate("following", "_id") // Only get following IDs
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's posts with essential fields
    const userPosts = await Post.find({ user: id }).populate("user", "name profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total likes from all posts
    const totalLikes = userPosts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);

    // Format post media URLs correctly
    const formattedPosts = userPosts.map(post => ({
      ...post,
      profilePicture: post.user.profilePicture || null,
    }));

    // Add aggregated data to user object
    const formattedUser = {
      ...user,
      followersCount: user.followers.length || 0,
      followingCount: user.following.length || 0,
      totalLikes,
      posts: formattedPosts,
      profilePicture: user.profilePicture || null,
      coverPicture: user.coverPicture ||null,
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from token
    const { bio, department, year, skills, badges, achievements, location,category } = req.body;

    console.log("Received Data:", { bio, department, year, skills, badges, achievements, location });

    // Get Cloudinary URLs from uploaded files
    const profilePhoto = req.files["profilePhoto"] ? req.files["profilePhoto"][0].path : null;
    const coverPhoto = req.files["coverPhoto"] ? req.files["coverPhoto"][0].path : null;
    console.log("profile:",profilePhoto);
    console.log("coverphoto:",coverPhoto)
    // Find the user
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (bio) user.bio = bio.substring(0, 50); // Limit bio to 50 chars
    if (department) user.department = department;
    if (year) user.year = year;
     if (category) user.category = category;
    if (location) user.location = location;
    if (coverPhoto) user.coverPicture = coverPhoto; // Update cover photo if new file is uploaded
    if (profilePhoto) user.profilePicture = profilePhoto;

    // Convert skills & badges from comma-separated string to array
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim());
    }

    if (badges) {
      user.badges = Array.isArray(badges) ? badges : badges.split(",").map(badge => badge.trim());
    }

    if (achievements) user.achievements = achievements.substring(0, 100); // Limit achievements to 100 chars

    await user.save(); // Save updated user

    await logActivity(req.user.id, "updated_profile");

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//to delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user's posts, comments, likes, messages, and chats
    await Post.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await Like.deleteMany({ user: userId });
    await Chat.deleteMany({ sender: userId });  // Assuming sender is the correct field
    await Message.deleteMany({ sender: userId });

    // Delete follow requests related to the user
    await FollowRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });

    // Delete notifications related to the user
    await Notification.deleteMany({ user: userId });

    // Remove user from Followers and Following collections
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );

    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );


    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const chatbotAPI = async (req, res) => {
  try {
    const { message } = req.body;
    

    const geminiApiKey = process.env.GEMINI_API_KEY;
    /* console.log("gemini api",geminiApiKey); */
    // Custom responses for RGMCET-specific queries
    const knowledgeBase = {
      "what courses are offered?": "RGMCET offers B.Tech in CSE, ECE, EEE, Civil, Mechanical, and AI & DS.",
      "what is the admission process?": "Admissions at RGMCET are based on EAMCET/JEE rankings and management quota.",
      "where is RGMCET located?": "RGMCET is located in Nandyal, Andhra Pradesh.",
      "who is the principal?": "The current principal of RGMCET is Dr. XYZ."
      // Add more key-value pairs as needed
    };

    // Check if the message matches any predefined queries
    const lowerCaseMessage = message.toLowerCase();
    if (knowledgeBase[lowerCaseMessage]) {
      return res.json({ reply: knowledgeBase[lowerCaseMessage] });
    }


    // Sending request to Google Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ role: "user", parts: [{ text: `Provide information about RGMCET: ${message}` }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I could not process your request.";

    /* console.log("Reply:", reply); */
    res.json({ reply });

  } catch (error) {
    console.error("Error in chatbot:", error.response?.data || error.message);
    res.status(500).json({ error: "Chatbot is currently unavailable." });
  }
};



const getTrending = async (req, res) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Request trending topics from Google Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Give me 5 trending topics today with their relevant URLs in an array of objects format like this: [{ "topic": "Topic Name", "url": "Relevant URL" }]`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const trendingTopics =
      JSON.parse(response.data.candidates?.[0]?.content?.parts?.[0]?.text) ||
      [];

    res.json({ trendingTopics });
  } catch (error) {
    console.error("Error in chatbot:", error.response?.data || error.message);
    res.status(500).json({ error: "Chatbot is currently unavailable." });
  }
};


const getUserAnalytics = async (req, res) => {
  try {
    const { _id } = req.user; // Get the user ID from request parameters
    const userId=_id;
   /*  console.log(`Fetching analytics data for user: ${userId}`); */

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Likes Analytics (Total likes received by the user's posts)
   lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthLikes = await Post.aggregate([
      { 
        $match: { 
          user: userId, 
          createdAt: { $gte: lastMonth } // Filter posts created within the last month
        } 
      },
      { 
        $project: { 
          likesCount: { $size: "$likes" } // Count likes array size for each post
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalLikes: { $sum: "$likesCount" } // Sum up likes from all posts
        } 
      }
    ]);

// Get total likes count (if no likes, return 0)
    const totalLikes = lastMonthLikes.length > 0 ? lastMonthLikes[0].totalLikes : 0;

    console.log("Total Likes in Last Month:", totalLikes);

    lastWeek.setDate(lastWeek.getDate() - 7);

const lastWeekLikes = await Post.aggregate([
  {
    $match: {
      user: userId, 
      createdAt: { $gte: lastWeek } // Filter posts from the last 7 days
    }
  },
  {
    $project: {
      likesCount: { $size: "$likes" } // Count likes per post
    }
  },
  {
    $group: {
      _id: null, 
      totalLikes: { $sum: "$likesCount" } // Sum up likes from all posts
    }
  }
]);

// Get total likes count (return 0 if no posts found)
const totalWeekLikes = lastWeekLikes.length > 0 ? lastWeekLikes[0].totalLikes : 0;

console.log("Total Likes in Last Week:", totalWeekLikes);

    // Followers Analytics (Total followers the user has)
    const user = await User.findById(userId).select("followers");
    const totalFollowers = user?.followers?.length || 0;

    // Post Count (Number of posts made by the user)
    const lastMonthPosts = await Post.countDocuments({ user: userId, createdAt: { $gte: lastMonth } });
    const lastWeekPosts = await Post.countDocuments({ user: userId, createdAt: { $gte: lastWeek } });

    // User Ranking
    const userRanking = user?.rank || 0;

    res.json({
      userId,
      lastMonthStats: {
        likes: totalLikes,
        followers: totalFollowers,
        ranking: userRanking,
        posts: lastMonthPosts,
      },
      lastWeekStats: {
        likes: totalWeekLikes,
        followers: totalFollowers,
        ranking: userRanking,
        posts: lastWeekPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔥 Fetch followers and following
    const user = await User.findById(userId)
      .populate("followers", "name _id profilePicture")
      .populate("following", "name _id profilePicture");

    // Combine followers and following into a Set to remove duplicates
    const connectionSet = new Map();

    [...user.followers, ...user.following].forEach((user) => {
      connectionSet.set(user._id.toString(), user);
    });

    // Get all chat conversations where the logged-in user is a participant
    const chats = await Chat.find({ users: userId })
      .populate("users", "name _id profilePicture")
      .sort({ updatedAt: -1 }); // Sort by latest activity

    // Add only users from the chats who are also in the connectionSet (followers/following)
    chats.forEach((chat) => {
      chat.users.forEach((user) => {
        if (user._id.toString() !== userId && connectionSet.has(user._id.toString())) {
          connectionSet.set(user._id.toString(), user);
        }
      });
    });

    // Convert the Map back to an array and return sorted connections
    const sortedConnections = Array.from(connectionSet.values());
     
    res.status(200).json(sortedConnections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ message: "Server error", error });
  }
};











module.exports = {
  registerUser,
  loginUser,
  googleLoginUser,
  getUserProfile,
  updateProfile,
  deleteAccount,
  getTrending,
  chatbotAPI,
  getUserAnalytics,
  getConnections
};

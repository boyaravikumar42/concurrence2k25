const User = require("../models/User");

// ✅ Helper function to log activity
const logActivity = async (userId, action, targetPost = null, targetUser = null) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLogs: {
          action,
          targetPost,
          targetUser,
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// ✅ Fetch User's Activity Logs
const getUserActivityLogs = async (req, res) => {
  try {
  const user = await User.findById(req.user.id)
  .select("activityLogs") // Fetch only activityLogs
  .populate("activityLogs.targetPost", "text")
  .populate("activityLogs.targetUser", "name profilePicture");

// Sort & Limit the Activity Logs on the Backend
    if (user && user.activityLogs) {
      user.activityLogs.sort((a, b) => b.timestamp - a.timestamp); // Sort by latest
      user.activityLogs = user.activityLogs.slice(0, 10); // Get only latest 10
    }


    res.json(user);
  } catch (error) { 
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { logActivity, getUserActivityLogs };

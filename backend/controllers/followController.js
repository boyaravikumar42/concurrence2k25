
const FollowRequest = require("../models/FollowRequest");
const User = require("../models/User");
const { logActivity } = require("./activityController");
const {sendNotification} = require("./sendNotificationController");

// 📌 Send Follow Request
const sendFollowRequest = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    
    const existingRequest = await FollowRequest.findOne({ follower: followerId, following: followingId });

    if (existingRequest) {
      return res.status(400).json({ message: "Follow request already sent or accepted" });
    }
    
    const followRequest = new FollowRequest({ follower: followerId, following: followingId, status: "Pending" });
    await followRequest.save();
    
     // Send notification
      /* await sendNotification({
        sender: req.user.id,
        receiver: userToFollow._id,
        type: "follow",
      }); */
    await logActivity(req.user.id, "requested_to_follow");
     /*  console.log("reqested follow"); */
    res.status(200).json({ message: "Follow request sent", status: "Pending" });
  } catch (error) {
    res.status(500).json({ message: "Error sending follow request", error });
  }
};

// 📌 Get Follow Requests for a User
const getFollowRequests = async (req, res) => {
  try {
    
    const userId = req.params.id;
    const requests = await FollowRequest.find({ following: userId, status: "Pending" })
      .populate("follower", "name profilePicture");
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching follow requests", error });
  }
};

// 📌 Accept Follow Request
const acceptFollowRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status === "Accepted") {
      return res.status(400).json({ message: "Request already accepted" });
    }

    // Update request status
    request.status = "Accepted";
    await request.save();

     await logActivity(req.user.id, "accepted_follow");

    // Update both users' follow lists in parallel
    const [updatedFollowingUser, updatedFollowerUser] = await Promise.all([
      User.findByIdAndUpdate(
        request.following,
        { $addToSet: { followers: request.follower } },
        { new: true }
      ),
      User.findByIdAndUpdate(
        request.follower,
        { $addToSet: { following: request.following } },
        { new: true }
      ),
    ]);
     await sendNotification({
      sender: req.user.id, // The user who accepted the follow request
      receiver: request.follower, // The user who is now followed
      type: "followed",
    });

    res.status(200).json({
      message: "Follow request accepted",
      follower: updatedFollowerUser,
      following: updatedFollowingUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting follow request", error });
  }
};


// 📌 Reject Follow Request
const rejectFollowRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    await FollowRequest.findByIdAndUpdate(request._id, { status: "Rejected" });
    
    await logActivity(req.user.id, "rejected_follow");
     await sendNotification({
      sender: req.user.id, // The user who accepted the follow request
      receiver: request._id, // The user who is now followed
      type: "rejected",
    });
    res.status(200).json({ message: "Follow request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting follow request", error });
  }
};


// Get followers of a user
const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
      console.log("getfollowers entered")
    const followers = await FollowRequest.find({ following: id, status: "Accepted" })
      .populate("follower", "name profilePicture");

    res.status(200).json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: "Error fetching followers", error });
  }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const following = await FollowRequest.find({ follower: id, status: "Accepted" })
      .populate("following", "name profilePicture");

    res.status(200).json(following.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: "Error fetching following", error });
  }
};

// ✅ Check Follow Status
const checkFollowStatus = async (req, res) => {
  try {
    const { id } = req.params; // Profile user's ID
    const currentUserId = req.user.id; // Logged-in user ID

    // 🔍 Check if follow request exists
    const followRequest = await FollowRequest.findOne({
      follower: currentUserId,
      following: id,
    });

    if (!followRequest) {
      return res.json({ followed: false, pending: false ,rejected:false });
    }

    if (followRequest.status === "Pending") {
      return res.json({ followed: false, pending: true,rejected:false });
    }

    if (followRequest.status === "Accepted") {
      return res.json({ followed: true, pending: false,rejected:false });
    }
     if (followRequest.status === "Rejected") {
      return res.json({ followed: false, pending: false ,rejected:true});
    }
    res.json({ followed: false, pending: false });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};






module.exports = {
  sendFollowRequest,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest, 
  getFollowers, 
  getFollowing, 
  checkFollowStatus,
};

const express = require("express");
const {
  sendFollowRequest,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} = require("../controllers/followController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/send-follow",protect, sendFollowRequest);//
router.get("/:id/follow-requests",protect, getFollowRequests);//
router.put("/accept-follow/:requestId",protect, acceptFollowRequest);//
router.put("/reject-follow/:requestId",protect ,rejectFollowRequest);//
router.get("/:id/followers", protect, getFollowers);//
router.get("/:id/following", protect, getFollowing);//
router.get("/:id/is-followed", protect, checkFollowStatus);//


module.exports = router;

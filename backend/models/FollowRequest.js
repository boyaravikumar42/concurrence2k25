const mongoose = require("mongoose");

const FollowRequestSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FollowRequest", FollowRequestSchema);

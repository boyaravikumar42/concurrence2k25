const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Track individual posts
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Track individual users
    adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ad" }, // Track advertisements
    type: { type: String, enum: ["post", "ad", "user"], required: true }, // Type of entity being tracked
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }, // Only for Ads
    engagementRate: { type: Number, default: 0 }, // (Engagements/Views) * 100
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analytics", AnalyticsSchema);

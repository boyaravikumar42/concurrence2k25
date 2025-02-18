const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    media: [{ type: String }], // Array of image/video URLs $ and also even pdfs
    hashtags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    shares: { type: Number, default: 0 },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isFlagged: { type: Boolean, default: false },//"isFlagged" can be used to mark posts, comments, or profiles that have been reported as inappropriate, abusive, or spam
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "https://res.cloudinary.com/dl5z0cqra/image/upload/v1739714958/profile_photos/1739714954269-account_circle.png.png" },
    coverPicture: { type: String, default: "https://res.cloudinary.com/dl5z0cqra/image/upload/v1739715173/profile_photos/1739715170355-download.png.png" },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College"},
    department: {
      type: String,
      enum: ["CSE", "EEE", "Civil", "Mech", "ECE", "MBA"], // Restrict department values
    },
    category: {
      type: String,
      enum: ["Student", "Lecturer", "Alumini"], 
    },
    year: { type: Number, enum: [1, 2, 3, 4] }, // Year values restricted
    skills: [{ type: String, trim: true }], // Array of skills
    badges: [{ type: String, trim: true }], // Array of badges
    achievements: { type: String, default: "", maxlength: 100 }, // Max 100 characters
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
    rank:{type:Number},
    location:{type:String},
    googleId: { type: String,  sparse: true },
    isAdmin: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },
       activityLogs: [
      {
        action: { type: String, enum: [
          "created_post", "liked_post","requested_to_follow","accepted_follow","rejected_follow","saved_post",
          "shared_post","unliked_post","unsaved_post","updated_profile",
          "comment_posted","searched_something"], required: true },
          targetPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
          targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
          timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // College name
    location: { type: String, required: true }, // College location
    departments: [{ type: String }], // List of departments
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Associated students
    alumni: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Alumni users
  },
  { timestamps: true }
);

module.exports = mongoose.model("College", CollegeSchema);

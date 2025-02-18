const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv=require('dotenv');
dotenv.config();
const protect = async (req, res, next) => {
  try {
    
    const token = req.header("Authorization")?.replace("Bearer ", "") ;
      /* console.log("token",token)   */
    if (!token) return res.status(401).json({ message: "Unauthorized" });
      /* console.log("here");  */
    const decoded =jwt.verify(token, process.env.JWT_SECRET);
   /* console.log("decoded",decoded); */ 
    req.user = await User.findById(decoded.userId || decoded.id).select("-password");
    /* console.log("jjjjj",req.user); */
    if (!req.user) return res.status(401).json({ message: "User not found" });
   /* console.log("proceed");  */
    /* console.log("user",req.user);  */
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
     if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Authentication failed." });
    }
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
  }

module.exports = { protect };

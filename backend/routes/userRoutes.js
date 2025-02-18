const express = require("express");
const { registerUser, loginUser,googleLoginUser, getUserProfile, followUser, deactivateAccount, updateProfile, getTrending, deleteAccount, chatbotAPI,  getUserAnalytics, getConnections } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
 const {uploadProfile} =require("../middlewares/multer");  

const router = express.Router();

router.post("/register", registerUser);
 router.post("/login", loginUser); 
 router.post("/google",googleLoginUser);
/* router.put("/updateprofile", upload.fields([{ name: "profilePhoto" }, { name: "coverPhoto" }]),protect,updateProfile) */

router.put("/updateprofile",protect,
  uploadProfile.fields([{ name: "profilePhoto", maxCount: 1 }, { name: "coverPhoto", maxCount: 1 }]),
  updateProfile
);
router.delete("/delete-account", protect, deleteAccount);
router.get("/trending/topic",protect,getTrending);
router.post("/chatbot",protect,chatbotAPI)
router.get("/stats",protect,getUserAnalytics);
router.get('/connections',protect,getConnections)
router.get("/:id", protect, getUserProfile);
module.exports = router;

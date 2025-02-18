const dbConfig=require('mongoose')
const dotenv = require("dotenv");
const User = require('../models/User');
dotenv.config();

dbConfig.connect(process.env.MONGODB_URI).then(async()=>{
  console.log("database connected");
  /* try {
      await User.collection.dropIndex("googleId_1");
      console.log("Dropped index googleId_1 successfully");
    } catch (err) {
      if (err.code === 27) {
        console.log("Index googleId_1 does not exist, skipping...");
      } else {
        console.error("Error dropping index:", err.message);
      }
    }
 */}).catch((err)=>console.log(err.message))

module.exports=dbConfig;


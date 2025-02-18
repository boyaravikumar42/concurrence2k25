
const express = require("express");
const dbConfig=require('./config/dbConfig')
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const route=express();
const path=require('path');
const http = require("http");
const { Server } = require("socket.io");

const userRoutes=require('./routes/userRoutes')
const postRoutes=require('./routes/postRoutes')
const likesRoutes=require('./routes/likeRoutes')
const commentsRoutes=require('./routes/commentRoutes')
const rankingRoutes = require("./routes/rankingRoutes");
const followRoutes=require("./routes/followRoutes")
const activityLogs=require("./routes/activityRoutes")
const notificationRoutes=require("./routes/notificationRoutes")
const searchRoutes=require('./routes/searchRoutes')
const chatRoutes=require('./routes/chatRoutes')
const messageRoutes=require('./routes/messageRoutes')

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust to your frontend URL
    methods: ["GET", "POST"],
  },
});


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors({ 
  origin: '*' 
})); 


app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/likes',likesRoutes);
app.use('/api/comments',commentsRoutes)
app.use("/api", rankingRoutes);
app.use('/api/follow',followRoutes)
app.use('/api/logs',activityLogs)
app.use('/api/notifications',notificationRoutes)
app.use('/api/search',searchRoutes)
app.use('/api/chats',chatRoutes)
app.use('/api/messages',messageRoutes)



const PORT = process.env.PORT || 5000;
console.log(process.env.PORT);


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import "./MessagingPage.css";
  const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/connections", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setUsers(response.data);
        const unreadData = {};
        const lastMessageData = {};

        response.data.forEach(user => {
          unreadData[user._id] = user.unreadMessages || 0;
          lastMessageData[user._id] = user.lastMessage || "";
        });

        setUnreadCounts(unreadData);
        setLastMessages(lastMessageData);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };
const MessagingPage = () => {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="messaging-container blue-theme enhanced-ui">
      <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} fetchChats={fetchChats}/>
      <ChatArea activeChat={activeChat} fetchChats={fetchChats} setActiveChat={setActiveChat}/>
    </div>
  );
};

export default MessagingPage;

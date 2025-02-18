import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios";

const Sidebar = ({ setActiveChat }) => {
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // Add search state

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/connections", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
         // Sort chats by `updatedAt` (recent messages first)
        const sortedChats = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setUsers(sortedChats);
        /* setUsers(response.data); */
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

    fetchChats();
  }, []);

  const startChat = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chats",
        { userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setActiveChat(response.data);

      // Reset unread count
      await axios.put(`http://localhost:5000/api/messages/reset-unread/${response.data._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setUnreadCounts((prev) => ({ ...prev, [userId]: 0 }));
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // 🔍 **Filter users based on search input**
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      <h3>Messaging</h3>
      <div className="search-bar">
        <Search className="search-icon" />
        <input 
          type="text" 
          placeholder="Search users..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
      </div>
      <div className="user-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="conversation" onClick={() => startChat(user._id)}>
              <div>{user.name}</div>
              <div className="last-message">{lastMessages[user._id]}</div>
              {unreadCounts[user._id] > 0 && <span className="unread-count">{unreadCounts[user._id]}</span>}
            </div>
          ))
        ) : (
          <div className="no-results">No users found</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

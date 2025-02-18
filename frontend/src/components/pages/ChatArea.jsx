import React, { useState, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import axios from "axios";
import Loader from "./Loader";

const ChatArea = ({ activeChat, setActiveChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const userId = localStorage.getItem("user");
  const userName = localStorage.getItem("userName"); // Store sender name
 const [loading, setLoading] = useState(true);
  // Load active chat from localStorage (persist chat selection after refresh)
  useEffect(() => {
    const storedChat = localStorage.getItem("activeChat");
    if (storedChat) {
      setActiveChat(JSON.parse(storedChat));
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      // Store active chat in localStorage
      localStorage.setItem("activeChat", JSON.stringify(activeChat));
     setLoading(true);
      axios
        .get(`http://localhost:5000/api/messages/${activeChat._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));

      // Reset unread messages count
      axios.put(`http://localhost:5000/api/messages/reset-unread/${activeChat._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLoading(false)
    }
  }, [activeChat]);

  const sendMessage = async () => {
    if (newMessage.trim() && activeChat) {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:5000/api/messages",
          { chatId: activeChat._id, content: newMessage },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setLoading(false);
        // Ensure sender object contains both ID and name
        const sentMessage = {
          ...response.data,
          sender: { _id: userId, name: userName }, // Set sender name
        };

        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setNewMessage("");
      } catch (error) {
        setLoading(false);
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="chat-window">
        <div className="chat-header">
        {activeChat ? (
            <h3>
            {activeChat.users
                .filter(user => user._id !== localStorage.getItem("user")) // Exclude current user
                .map(user => user.name)
                .join(", ")}
            </h3>
        ) : (
            <h3>Chat</h3>
        )}
        </div>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id} className={`message ${msg.sender._id === userId ? "sent" : "received"}`}>
            <p>
              <strong></strong> {msg.content}
            </p>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Write a message..." />
        <button onClick={sendMessage}><Send /></button>
      </div>
    </div>
  );
};

export default ChatArea;

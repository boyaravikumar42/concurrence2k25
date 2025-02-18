import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const token = localStorage.getItem("token");

  // Detect User Typing
  useEffect(() => {
    if (input.trim() !== "") {
      setIsUserTyping(true);
      const timeout = setTimeout(() => setIsUserTyping(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [input]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setIsBotTyping(true); // Show bot typing indicator

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/chatbot",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTimeout(() => {
        setMessages([...newMessages, { text: response.data.reply, sender: "bot" }]);
        setIsBotTyping(false); // Hide bot typing indicator
      }, 1500); // Simulating bot response delay
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...newMessages, { text: "Sorry, something went wrong.", sender: "bot" }]);
      setIsBotTyping(false);
    }
  };

  return (
    <div className="chatbot-container-page">
      <div className="chatbot-container">
        <div className="chat-header">College Chatbot</div>
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isUserTyping && input && <div className="typing-indicator user">You are typing...</div>}
          {isBotTyping && <div className="typing-indicator bot">RGMCET is typing...</div>}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={isBotTyping}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

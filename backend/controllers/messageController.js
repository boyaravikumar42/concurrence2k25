const Message = require("../models/Message");
const Chat = require("../models/Chat");

// 🔹 Send a Message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user.id;

    if (!content || !chatId) {
      return res.status(400).json({ error: "Message content or chatId missing" });
    }

    // 🔥 Create and save the new message
    const newMessage = await Message.create({ chat: chatId, sender: senderId, content });

    // 🔥 Update chat with last message and `updatedAt`
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: newMessage._id, updatedAt: new Date() }, // ✅ `updatedAt` manually updated
      { new: true }
    ).populate("users");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 🔥 Ensure unreadCounts exists
    if (!chat.unreadCounts) {
      chat.unreadCounts = new Map();
    }

    // 🔥 Increment unread count for other users
    chat.users.forEach((user) => {
      if (user._id.toString() !== senderId) {
        chat.unreadCounts.set(user._id.toString(), (chat.unreadCounts.get(user._id.toString()) || 0) + 1);
      }
    });

    await chat.save(); // ✅ Save updated chat

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending message", details: error });
  }
};




const resetUnreadCount = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await Chat.findByIdAndUpdate(chatId, { $set: { [`unreadCounts.${userId}`]: 0 } });

    res.status(200).json({ message: "Unread messages cleared" });
  } catch (error) {
    res.status(500).json({ error: "Error resetting unread count", details: error });
  }
};



// 🔹 Get Messages for a Chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId }).populate("sender", "name");
    /* console.log("messages:",messages); */
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages", details: error });
  }
};

module.exports = { sendMessage, getMessages ,resetUnreadCount};

const Chat = require("../models/Chat");
const User = require("../models/User");

// Function to Create and also access chat between two users
// /api/chat/
const accessChat = async (req, res) => {
  const { userId } = req.body; // ID of the user to chat with
  const loggedInUserId = req.user.id; // ID of the logged-in user

  try {
    let chat = await Chat.findOneAndUpdate(
      {
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: loggedInUserId } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      },
      { updatedAt: Date.now() }, // Update `updatedAt` to sort by recent chats
      { new: true }
    ).populate("users", "name email profilePicture bio");

    if (!chat) {
      // Create new chat if it doesn't exist
      chat = await Chat.create({
        isGroupChat: false,
        users: [loggedInUserId, userId],
      });

      chat = await chat.populate("users", "name email profilePicture bio");
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { accessChat };

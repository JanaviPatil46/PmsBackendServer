const InternalChat = require("../models/InternalChat");
const User = require("../models/userModel")

const nodemailer = require("nodemailer");

// exports.sendMessage = async (req, res) => {
//   try {
//     const {
//       teammemberid,
//       description, // this is an array
//     } = req.body;

//     if (!teammemberid || !Array.isArray(description) || description.length === 0) {
//       return res.status(400).json({ success: false, message: "Missing or invalid data" });
//     }

//     const { message, fromwhome, senderid, replyTo = null, isRead = false } = description[0];

//     const teamMember = await User.findById(teammemberid);
//     if (!teamMember || !teamMember.email) {
//       return res.status(404).json({ success: false, message: "Team member not found or has no email" });
//     }
//        // Fetch sender details
//        const sender = await User.findById(senderid);
//        const senderName = sender?.username || "Someone";

//     const newMessage = {
//       message,
//       fromwhome,
//       senderid,
//       replyTo,
//       isRead,
//       time: new Date()
//     };

//     let chat = await InternalChat.findOne({ teammemberid });
// console.log("from", senderid)
//     if (!chat) {
//       chat = new InternalChat({
//         teammemberid,
//         description: [newMessage],
//         active: req.body.active === "true" // convert string to boolean
//       });
//     } else {
//       chat.description.push(newMessage);
//       chat.active = req.body.active === "true";
//     }

//     await chat.save();

//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD
//       },
//       tls: {
//         rejectUnauthorized: false
//       }
//     });

//     const chatLink = `http://localhost:3001/internalchat/${chat._id}`;
//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: teamMember.email,
//       subject: `New internal message from ${fromwhome}`,
//       html: `
//         <p>Hello ${teamMember.username || "Team Member"},</p>
//         <p>You have a new secure message from <b>${senderName}</b>:</p>
//         <blockquote>${message}</blockquote>
        
//       `
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log(`Email sent to ${teamMember.email}`);
//     } catch (emailError) {
//       console.error("Failed to send email:", emailError.message);
//     }

//     res.status(200).json({ success: true, chat });
//   } catch (error) {
//     console.error("sendMessage error:", error.message);
//     res.status(500).json({ success: false, message: "Failed to send message" });
//   }
// };


exports.sendMessage = async (req, res) => {
  try {
    const { participants, description, active = "true" } = req.body;

    if (
      !Array.isArray(participants) ||
      participants.length !== 2 ||
      !Array.isArray(description) ||
      description.length === 0
    ) {
      return res.status(400).json({ success: false, message: "Missing or invalid data" });
    }

    const { message, fromwhome, senderid, replyTo = null, isRead = false } = description[0];
    const receiverId = participants.find((id) => id !== senderid);

    const sender = await User.findById(senderid);
    const receiver = await User.findById(receiverId);

    if (!receiver || !receiver.email) {
      return res.status(404).json({ success: false, message: "Receiver not found or missing email" });
    }

    const newMessage = {
      message,
      fromwhome,
      senderid,
      replyTo,
      isRead,
      time: new Date(),
    };

    let chat = await InternalChat.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!chat) {
      chat = new InternalChat({
        participants,
        description: [newMessage],
        active: active === "true",
      });
    } else {
      chat.description.push(newMessage);
      chat.active = active === "true";
    }

    await chat.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: receiver.email,
      subject: `New internal message from ${sender?.username || "Someone"}`,
      html: `
        <p>Hello ${receiver.username || "User"},</p>
        <p>You have a new secure message from <b>${sender?.username || "Someone"}</b>:</p>
        <blockquote>${message}</blockquote>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email error:", emailError.message);
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};



// exports.getAllChats = async (req, res) => {
//   try {
//     const chats = await InternalChat.find().populate({ path: "teammemberid", model: "User" })
//     .populate({ path: "description.senderid", model: "User" });
//     res.status(200).json({ success: true, chats });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getAllChats = async (req, res) => {
  try {
    const chats = await InternalChat.find()
      .populate("participants", "username email")
      .populate("description.senderid", "username email");

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// exports.getChatById = async (req, res) => {
//   try {
//     const { chatId } = req.params;

//     const chat = await InternalChat.findById(chatId)
//       .populate({ path: "teammemberid", model: "User" })
//       .populate({ path: "description.senderid", model: "User" });

//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: "Chat not found",
//       });
//     }

//     res.status(200).json({ success: true, chat });
//   } catch (error) {
//     console.error("Error fetching chat by ID:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// Get chat by team member ID




exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await InternalChat.findById(chatId)
      .populate("participants", "username email")
      .populate("description.senderid", "username email");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// exports.getChatByTeammember = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const chats = await InternalChat.findOne({ teammemberid: id }).populate({ path: "teammemberid", model: "User" })
//     .populate({ path: "description.senderid", model: "User" });

//     if (!chats) return res.status(404).json({ success: false, message: "Chat not found" });

//     res.status(200).json({ success: true, chats });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Mark message as read

exports.getChatByParticipants = async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ success: false, message: "Missing user IDs" });
    }

    const chat = await InternalChat.findOne({
      participants: { $all: [user1, user2], $size: 2 },
    })
      .populate("participants", "username email")
      .populate("description.senderid", "username email");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// exports.markAsRead = async (req, res) => {
//   try {
//     const { chatId, messageId } = req.params;

//     const chat = await InternalChat.findById(chatId);
//     if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

//     const message = chat.description.id(messageId);
//     if (!message) return res.status(404).json({ success: false, message: "Message not found" });

//     message.isRead = true;
//     await chat.save();

//     res.status(200).json({ success: true, message: "Marked as read" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Delete a message
// exports.deleteMessage = async (req, res) => {
//   try {
//     const { chatId, messageId } = req.params;

//     const chat = await InternalChat.findById(chatId);
//     if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

//     chat.description.id(messageId).remove();
//     await chat.save();

//     res.status(200).json({ success: true, message: "Message deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
exports.markAsRead = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    const chat = await InternalChat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    const message = chat.description.id(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    message.isRead = true;
    await chat.save();

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// exports.deleteMessage = async (req, res) => {
//   try {
//     const { chatId, messageId } = req.body;

//     // Validate required fields
//     if (!chatId || !messageId) {
//       return res
//         .status(400)
//         .json({ message: "chatId and messageId are required." });
//     }

//     const updatedChat = await InternalChat.findOneAndUpdate(
//       { _id: chatId }, // Match the chat document by chatId
//       {
//         $pull: {
//           description: { _id: messageId }, // Remove the message with the matching _id
//         },
//       },
//       { new: true } // Return the updated document after deletion
//     );

//     if (updatedChat) {
//       return res.status(200).json({
//         message: "Message deleted successfully",
//         updatedChat,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Chat or message not found.",
//       });
//     }
//   } catch (error) {
//     console.error("Error deleting message:", error);
//     return res.status(500).json({
//       message: "An error occurred while deleting the message.",
//       error: error.message,
//     });
//   }
// };




// Delete entire chat



exports.deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.body;

    if (!chatId || !messageId) {
      return res.status(400).json({ success: false, message: "chatId and messageId are required" });
    }

    const updatedChat = await InternalChat.findByIdAndUpdate(
      chatId,
      { $pull: { description: { _id: messageId } } },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: "Chat or message not found" });
    }

    res.status(200).json({ success: true, updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};








// exports.deleteChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await InternalChat.findByIdAndDelete(id);
//     res.status(200).json({ success: true, message: "Chat deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    await InternalChat.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// exports.markAllInternalMessagesAsRead = async (req, res) => {
//   try {
//     const { chatId } = req.params;

//     const chat = await InternalChat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: "Internal chat not found",
//       });
//     }

//     // Mark all messages as read
//     chat.description.forEach((msg) => {
//       msg.isRead = true;
//     });

//     await chat.save();

//     res.status(200).json({
//       success: true,
//       message: `All messages marked as read in chat ${chatId}`,
//     });
//   } catch (error) {
//     console.error("Error marking internal messages as read:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

exports.markAllInternalMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await InternalChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    chat.description.forEach((msg) => {
      msg.isRead = true;
    });

    await chat.save();

    res.status(200).json({ success: true, message: "All messages marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// controller/internalChatController.js

exports.getChatsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await InternalChat.find({
      participants: userId,
    })
      .populate("participants", "username email")
      .populate("description.senderid", "username email")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Add a message to an existing chat
// exports.addMessageToChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { messageData } = req.body;

//     if (!messageData || !chatId) {
//       return res.status(400).json({ success: false, message: "Invalid request" });
//     }

//     const chat = await InternalChat.findById(chatId);
//     if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

//     chat.description.push({
//       ...messageData,
//       time: new Date(),
//     });

//     await chat.save();

//     res.status(200).json({ success: true, message: "Message added", chat });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


exports.addMessageToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageData } = req.body;

    if (!messageData || !chatId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message or chatId" });
    }

    const chat = await InternalChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Add time server-side
    const newMessage = {
      ...messageData,
      time: new Date(),
    };

    chat.description.push(newMessage);
    await chat.save();

    // Get sender and receiver
    const sender = await User.findById(messageData.senderid);
    const receiver = chat.participants.find(
      (participant) => participant.toString() !== messageData.senderid
    );

    const receiverUser = await User.findById(receiver);
    if (!receiverUser || !receiverUser.email) {
      return res.status(200).json({
        success: true,
        message: "Message sent, but receiver email not found",
        chat,
      });
    }

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: receiverUser.email,
      subject: `New internal message from ${sender?.username || "Someone"}`,
      html: `
        <p>Hello ${receiverUser.username || "Team Member"},</p>
        <p>You have a new secure message from <b>${sender?.username || "Someone"}</b>:</p>
        <blockquote>${messageData.message}</blockquote>
        <p>Login to your dashboard to reply.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${receiverUser.email}`);
    } catch (emailError) {
      console.error("Email failed:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Message added and email sent",
      chat,
    });
  } catch (error) {
    console.error("Error in addMessageToChat:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

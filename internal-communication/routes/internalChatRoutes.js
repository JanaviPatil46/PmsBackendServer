const express = require("express");
const router = express.Router();
const internalChatController = require("../controllers/internalChatController");

// POST: Send or add message to a chat
router.post("/send", internalChatController.sendMessage);

// GET: Get all chats
router.get("/", internalChatController.getAllChats);


router.get("/:chatId", internalChatController.getChatById);


// GET: Get chat by team member ID
// router.get("/chatbyteam/:id", internalChatController.getChatByParticipants);
router.get("/by-participants", internalChatController.getChatByParticipants);


// PATCH: Mark message as read
router.patch("/:chatId/read/:messageId", internalChatController.markAsRead);

// DELETE: Delete specific message
router.delete("/:chatId/message/bymessageid/delete", internalChatController.deleteMessage);

// DELETE: Delete full chat
router.delete("/:id", internalChatController.deleteChat);

router.patch("/:chatId/markAllRead", internalChatController.markAllInternalMessagesAsRead);

router.get("/user/:userId", internalChatController.getChatsByUserId);

router.patch("/:chatId/message", internalChatController.addMessageToChat);

module.exports = router;

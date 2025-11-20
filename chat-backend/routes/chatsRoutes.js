const express = require('express');
const router = express.Router();
const {
    getAllChats,
    getChats,
    createChats,
    deleteChats,
    updateChats,
    getchatAccountwiselist,
    getisactivechatAccountwise,
    updateChatDescription,
    updateMessage,
    deleteMessage,
    addClientTask,updateChatFromClient,
    updateTaskCheckedStatus,getUnreadChatsWithLatestMessage,updateChatStatus,getUnreadChatsByAccountId,createChatsForAdmin,
getUnreadMessages , markMessageAsRead,
  markAllMessagesAsRead
} = require('../controller/chatsController');  // Adjust the path to where your controller file is

// Route to get all chat templates
router.get('/chatsaccountwise', getAllChats);

// Route to get a single chat template by its ID
router.get('/chatsaccountwise/:id', getChats);

// Route to get chat templates based on query filters
// router.get('/chatsaccountwise/chatlistbyaccount/:id', getchatAccountwiselist);
router.get('/chatsaccountwise/chatlistbyaccount/:id', getchatAccountwiselist);

// Route to create a new chat template
router.post('/chatsaccountwise', createChats);
router.post("/chatsaccountwise/admin", createChatsForAdmin);
// Route to delete a chat template by its ID
router.delete('/chatsaccountwise/:id', deleteChats);

// Route to update a chat template by its ID
router.patch('/chatsaccountwise/:id', updateChats);

router.get('/chatsaccountwise/isactivechat/:accountid/:isactive', getisactivechatAccountwise);

router.patch('/chatsaccountwise/chatupdatemessage/:id', updateChatDescription);

router.patch(
  "/chatsaccountwise/chatmessagefromclient/:id",
  updateChatFromClient
);
//update message
router.patch('/chatsaccountwise/chatmessage/bymessageid/update', updateMessage)
//delete msgs
router.delete('/chatsaccountwise/chatmessage/bymessageid/delete', deleteMessage)

//for resend client task button
router.post('/chatsaccountwise/addclienttask', addClientTask);



//update task client
router.post('/chatsaccountwise/updateTaskCheckedStatus', updateTaskCheckedStatus);

router.get('/unreadmessages',getUnreadChatsWithLatestMessage)

router.post('/accountchat/updatestatus/:id',updateChatStatus)
router.get('/unread/:accountid', getUnreadChatsByAccountId);
router.get('/unread/:accountid/:fromwhome',getUnreadMessages )
router.patch('/mark-as-read/:chatId/:messageId',markMessageAsRead)
router.patch('/mark-all-read/:chatId/accounts/:accountId/:fromwhome',markAllMessagesAsRead)

module.exports = router;

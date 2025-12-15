const Chats = require("../models/chatsModel");
const mongoose = require("mongoose");
const AccountwiseChat = require("../models/chatsModel");
const ChatTemplate = require("../models/ChatTempModels"); // Ensure this import is correct
const Accounts = require("../models/AccountModel");
const Account = require("../models/AccountModel");
const transporter = require("../middleware/nodemailer.js");
const currentDate = new Date();
const lastDay = new Date(currentDate);
lastDay.setDate(lastDay.getDate() - 1); // Subtract 1 day to get the last day
const nextDay = new Date(currentDate);
nextDay.setDate(nextDay.getDate() + 1); // Add 1 day to get the next day

// Define options for formatting date
const options = {
  weekday: "long", // Full name of the day of the week (e.g., "Monday")
  day: "2-digit", // Two-digit day of the month (01 through 31)
  month: "long", // Full name of the month (e.g., "January")
  year: "numeric", // Four-digit year (e.g., 2022)
  week: "numeric", // ISO week of the year (1 through 53)
  monthNumber: "2-digit", // Two-digit month number (01 through 12)
  quarter: "numeric", // Quarter of the year (1 through 4)
};

// // Format the current date using options
// const currentFullDate = currentDate.toLocaleDateString("en-US", options);
// const currentDayNumber = currentDate.getDate();
// const currentDayName = currentDate.toLocaleDateString("en-US", {
//   weekday: "long",
// });
// const currentWeek = currentDate.toLocaleDateString("en-US", {
//   week: "numeric",
// });
// const currentMonthNumber = currentDate.getMonth() + 1; // Months are zero-based, so add 1
// const currentMonthName = currentDate.toLocaleDateString("en-US", {
//   month: "long",
// });
// const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3); // Calculate the quarter
// const currentYear = currentDate.getFullYear();

// Format the last day using options
const lastDayFullDate = lastDay.toLocaleDateString("en-US", options);
const lastDayNumber = lastDay.getDate();
const lastDayName = lastDay.toLocaleDateString("en-US", { weekday: "long" });
const lastWeek = lastDay.toLocaleDateString("en-US", { week: "numeric" });
const lastMonthNumber = lastDay.getMonth() + 1; // Months are zero-based, so add 1
const lastMonthName = lastDay.toLocaleDateString("en-US", { month: "long" });
const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3); // Calculate the quarter
const lastYear = lastDay.getFullYear();

// Format the next day using options
const nextDayFullDate = nextDay.toLocaleDateString("en-US", options);
const nextDayNumber = nextDay.getDate();
const nextDayName = nextDay.toLocaleDateString("en-US", { weekday: "long" });
const nextWeek = nextDay.toLocaleDateString("en-US", { week: "numeric" });
const nextMonthNumber = nextDay.getMonth() + 1; // Months are zero-based, so add 1
const nextMonthName = nextDay.toLocaleDateString("en-US", { month: "long" });
const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3); // Calculate the quarter
const nextYear = nextDay.getFullYear();
// Get all ChatTemplates
const getAllChats = async (req, res) => {
  try {
    const accountChats = await AccountwiseChat.find().populate({
      path: "accountid",
      model: "Accounts",
    }); // Removed .populate('chattemplateid') since it's redundant
    res.status(200).json({
      message: "Chats Accountwise retrieved successfully",
      accountChats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single ChatTemplate
// const getChats = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const accountChats = await AccountwiseChat.findById(id)
//             .populate({ path: 'accountid', model: 'Accounts' })
//             // .populate({ path: 'chattemplateid', model: 'ChatTemplate' });

//         if (!accountChats) {
//             return res.status(404).json({ message: 'Chat not found' });
//         }

//         res.status(200).json({ message: "Chats Accountwise retrieved successfully", accountChats });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const getChats = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await AccountwiseChat.findById(id)
      .populate({
        path: "accountid",
        model: "clientAccount",
      })
      //.populate({ path: "description.senderid", model: "User" });
    // .populate({ path: 'chattemplateid', model: 'ChatTemplate' });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Fetch account details and populate contacts
    const account = await Accounts.findById(chat.accountid._id).populate(
      "contacts"
    );
    if (!account) {
      return res.status(404).json({ error: "Associated account not found" });
    }

       // Get placeholder values
    const currentDate = new Date();
    const placeholderValues = {
      ACCOUNT_NAME: account.accountName || "",
            CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
      CURRENT_DAY_NUMBER: new Date().getDate(),
      CURRENT_DAY_NAME: new Date().toLocaleString("default", {
        weekday: "long",
      }),
      CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
      CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
        month: "long",
      }),
      CURRENT_YEAR: new Date().getFullYear(),
      LAST_DAY_FULL_DATE: lastDayFullDate,
      LAST_DAY_NUMBER: lastDayNumber,
      LAST_DAY_NAME: lastDayName,
      LAST_WEEK: lastWeek,
      LAST_MONTH_NUMBER: lastMonthNumber,
      LAST_MONTH_NAME: lastMonthName,
      LAST_QUARTER: lastQuarter,
      LAST_YEAR: lastYear,
      NEXT_DAY_FULL_DATE: nextDayFullDate,
      NEXT_DAY_NUMBER: nextDayNumber,
      NEXT_DAY_NAME: nextDayName,
      NEXT_WEEK: nextWeek,
      NEXT_MONTH_NUMBER: nextMonthNumber,
      NEXT_MONTH_NAME: nextMonthName,
      NEXT_QUARTER: nextQuarter,
      NEXT_YEAR: nextYear,
    };

    // Replace placeholders in subject
    const replacePlaceholders = (template, data) => {
      return template.replace(
        /\[([\w\s]+)\]/g,
        (match, key) => data[key.trim()] || ""
      );
    };

    chat.chatsubject = replacePlaceholders(
      chat.chatsubject || "",
      placeholderValues
    );

    if (Array.isArray(chat.description)) {
      chat.description = chat.description.map((desc) => ({
        ...desc,
        message: replacePlaceholders(desc.message || "", placeholderValues),
      }));
    }

    res.status(200).json({ message: "Chat retrieved successfully", chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST a new ChatTemplate

const nodemailer = require("nodemailer");

const createChats = async (req, res) => {
  const {
    accountids,
    chattemplateid,
    templatename,
    from,
    chatsubject,
    description,
    sendreminderstoclient,
    daysuntilnextreminder,
    numberofreminders,
    clienttasks,adminUserId,
    active,
  } = req.body;

  if (!Array.isArray(accountids)) {
    return res.status(400).json({ error: "accountids must be an array" });
  }

  try {
    const createdChats = [];

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    for (const accountid of accountids) {
      const newChat = await AccountwiseChat.create({
        accountid,
        chattemplateid,
        templatename,
        from,
        chatsubject,
        description,
        sendreminderstoclient,
        daysuntilnextreminder,
        numberofreminders,
        clienttasks,adminUserId,
        active,
      });

      createdChats.push(newChat);
      console.log("new chat", newChat);
      // **Fetch Account Details**
      const account = await Account.findById(accountid).populate("contacts");
      if (!account) {
        console.warn(`Account not found for ID: ${accountid}`);
        continue;
      }

      const chatLink = `http://localhost:3001/updatechat/${newChat._id}`;

      // **Send Emails to Eligible Contacts**
      for (const contact of account.contacts) {
        if (contact.emailSync && contact.email) {
          const mailOptions = {
            from: process.env.EMAIL,
            to: contact.email,
            subject: `${account.accountName} sent you a secure chat`,
            html: `
                            <p><b>${account.accountName}</b></p>
                            <p>You have a new secure chat <b>${templatename}</b> from ${from}.</p>
                            <a href="${chatLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                                View Chat
                            </a>
                        `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${contact.email}`);
          } catch (emailError) {
            console.error(
              `Failed to send email to ${contact.email}:`,
              emailError.message
            );
          }
        }
      }
    }

    return res
      .status(201)
      .json({ message: "Chats created successfully", createdChats });
  } catch (error) {
    console.error("Error creating chats:", error);
    return res.status(500).json({ error: "Error creating chats" });
  }
};
const createChatsForAdmin = async (req, res) => {
  const {
    accountids,
    chattemplateid,
    templatename,
    from,
    chatsubject,
    description,
    active,
  } = req.body;

  if (!Array.isArray(accountids)) {
    return res.status(400).json({ error: "accountids must be an array" });
  }

  try {
    const createdChats = [];

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    for (const accountid of accountids) {
      // Fetch account with admin info
      const account = await Account.findById(accountid).populate("adminUserId");
      if (!account) {
        console.warn(`Account not found for ID: ${accountid}`);
        continue;
      }

      const adminEmail =
        account.adminUserId?.emailSyncEmail || account.adminUserId?.email || null;

      // Only send email if admin email exists
      if (adminEmail) {
        const clientMessage = description[0]?.message || "No content";
        const subject = chatsubject || "New Chat Message";
        const accountName = account.accountName || "Unknown Account";
        const clientId = account._id;

        const mailOptions = {
          from: `<${process.env.EMAIL}>`,
          to: adminEmail,
          subject: `#${clientId} New message ${subject} from ${accountName}`,
          html: `
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Account:</strong> ${accountName}</p>
            <p><strong>Message:</strong><br/>${clientMessage}</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Email sent to admin: ${adminEmail}`);
        } catch (emailError) {
          console.error(
            `Failed to send email to admin ${adminEmail}:`,
            emailError.message
          );
        }
      } else {
        console.warn(`Admin email not found for account ID: ${accountid}`);
      }

      // Create the chat regardless of whether admin email exists
      const newChat = await AccountwiseChat.create({
        accountid,
        chattemplateid,
        templatename,
        from,
        chatsubject,
        description,
        active,
      });

      createdChats.push(newChat);
      console.log("New chat created:", newChat);
    }

    return res
      .status(201)
      .json({ message: "Chats created successfully", createdChats });
  } catch (error) {
    console.error("Error creating chats:", error);
    return res.status(500).json({ error: "Error creating chats" });
  }
};


// Delete a ChatTemplate
const deleteChats = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
    }
    const deletedChataccountwise = await AccountwiseChat.findByIdAndDelete(id);

    if (!deletedChataccountwise) {
      return res.status(404).json({ error: "No such  Chat Accountwise" });
    }

    res.status(200).json({
      message: "Chat Accountwise deleted successfully",
      deletedChataccountwise,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a ChatTemplate
const updateChats = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
    }
    const updatedChats = await AccountwiseChat.findByIdAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    if (!updatedChats) {
      return res.status(404).json({ error: "No such Chat Accountwise" });
    }
    res
      .status(200)
      .json({ message: "Chat Accountwise Updated successfully", updatedChats });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateChatDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDescriptions } = req.body; // Assuming newDescriptions is an array of description objects

    // Validate the provided ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
    }

    // Validate newDescriptions
    if (!Array.isArray(newDescriptions) || newDescriptions.length === 0) {
      return res.status(400).json({ error: "No new descriptions provided" });
    }

    // Append new descriptions to the existing description array
    const updatedChats = await AccountwiseChat.findByIdAndUpdate(
      { _id: id },
      { $push: { description: { $each: newDescriptions } } }, // Use $push with $each to append multiple descriptions
      { new: true }
    );

    if (!updatedChats) {
      return res.status(404).json({ error: "No such Chat Accountwise" });
    }

    res.status(200).json({
      message: "New descriptions added successfully",
      updatedChats,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get ChatTemplates with filters (accountid, active)
const getchatAccountwiselist = async (req, res) => {
  try {
    const { id } = req.params;

    const chataccountwise = await AccountwiseChat.find({ accountid: id })
      .populate({ path: "accountid", model: "clientAccount" })
      .populate({ path: "chattemplateid", model: "ChatTemplate" });

    if (!chataccountwise) {
      return res.status(404).json({ error: "No such Chat Accountwise" });
    }

    res.status(200).json({
      message: "Chats Accountwise retrieved successfully",
      chataccountwise,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ChatTemplates with filters (accountid, active)
// const getisactivechatAccountwise = async (req, res) => {
//     try {
//         const { accountid, isactive } = req.params;

//         const chataccountwise = await AccountwiseChat.find({ accountid: accountid, active: isactive })
//             .populate({ path: 'accountid', model: 'Accounts' })
//             .populate({ path: 'chattemplateid', model: 'ChatTemplate' });

//         res.status(200).json({ message: "Chats Accountwise retrieved successfully", chataccountwise });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const getisactivechatAccountwise = async (req, res) => {
  try {
    // console.log(req.params.accountid);
    const chataccountwise = await AccountwiseChat.find({
      accountid: req.params.accountid,
      active: req.params.isactive,
    })
      .populate({ path: "accountid", model: "clientAccount" })
      .populate({ path: "chattemplateid", model: "ChatTemplate" }).sort({ createdAt: -1 });

      //.populate({ path: "description.senderid", model: "User" }).sort({ createdAt: -1 });

    if (!chataccountwise) {
      return res.status(404).json({ error: "Chats Accountwise not found" });
    }

    // Function to process chat data
    const processChatData = async (chataccountwise) => {
      for (const chat of chataccountwise) {
        // console.log(chat.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(chat.accountid._id).populate(
          "contacts"
        );
        if (!account) {
          console.error(`Account not found for ID: ${chat.accountid._id}`);
          continue; // Skip processing this chat if account is not found
        }

        

        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
                 CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
          CURRENT_DAY_NUMBER: new Date().getDate(),
          CURRENT_DAY_NAME: new Date().toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
          CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: new Date().getFullYear(),
          LAST_DAY_FULL_DATE: lastDayFullDate,
          LAST_DAY_NUMBER: lastDayNumber,
          LAST_DAY_NAME: lastDayName,
          LAST_WEEK: lastWeek,
          LAST_MONTH_NUMBER: lastMonthNumber,
          LAST_MONTH_NAME: lastMonthName,
          LAST_QUARTER: lastQuarter,
          LAST_YEAR: lastYear,
          NEXT_DAY_FULL_DATE: nextDayFullDate,
          NEXT_DAY_NUMBER: nextDayNumber,
          NEXT_DAY_NAME: nextDayName,
          NEXT_WEEK: nextWeek,
          NEXT_MONTH_NUMBER: nextMonthNumber,
          NEXT_MONTH_NAME: nextMonthName,
          NEXT_QUARTER: nextQuarter,
          NEXT_YEAR: nextYear,
        };

        // Function to replace placeholders in text
        const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || "";
          });
        };

        // Replace placeholders in the chat subject
        chat.chatsubject = replacePlaceholders(
          chat.chatsubject || "",
          placeholderValues
        );
        // Replace placeholders in the description messages
        if (Array.isArray(chat.description)) {
          chat.description = chat.description.map((desc) => ({
            ...desc,
            message: replacePlaceholders(desc.message || "", placeholderValues),
          }));
        }
      }
    };

    // Call the function to process chat data
    await processChatData(chataccountwise);

    res.status(200).json({
      message: "Chats Accountwise retrieved successfully",
      chataccountwise,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//update messages
const updateMessage = async (req, res) => {
  // console.log(req.body);
  try {
    const { chatId, messageId, newMessage } = req.body;

    // Validate required fields
    if (!chatId || !messageId || !newMessage) {
      return res
        .status(400)
        .json({ message: "chatId, messageId, and newMessage are required." });
    }

    const updatedChat = await AccountwiseChat.findOneAndUpdate(
      {
        _id: chatId,
        "description._id": messageId, // Match the specific message by its _id in the description array
      },
      {
        $set: {
          "description.$.message": newMessage, // Update the message field of the matched element
        },
      },
      { new: true } // Return the updated document
    );

    if (updatedChat) {
      return res.status(200).json({
        message: "Message updated successfully",
        updatedChat,
      });
    } else {
      return res.status(404).json({
        message: "Chat or message not found.",
      });
    }
  } catch (error) {
    console.error("Error updating message:", error);
    return res.status(500).json({
      message: "An error occurred while updating the message.",
      error: error.message,
    });
  }
};

//delete messages
const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.body;

    // Validate required fields
    if (!chatId || !messageId) {
      return res
        .status(400)
        .json({ message: "chatId and messageId are required." });
    }

    const updatedChat = await AccountwiseChat.findOneAndUpdate(
      { _id: chatId }, // Match the chat document by chatId
      {
        $pull: {
          description: { _id: messageId }, // Remove the message with the matching _id
        },
      },
      { new: true } // Return the updated document after deletion
    );

    if (updatedChat) {
      return res.status(200).json({
        message: "Message deleted successfully",
        updatedChat,
      });
    } else {
      return res.status(404).json({
        message: "Chat or message not found.",
      });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the message.",
      error: error.message,
    });
  }
};

///for resend client task button
const addClientTask = async (req, res) => {
  const { chatId, newTask } = req.body;
  console.log(newTask );

  try {
    // Find the chat document
    const chat = await AccountwiseChat.findById(chatId);
    // console.log(chat);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Clear the previous client tasks
   // chat.clienttasks = []; // This removes all the previous tasks
chat.clienttasks = newTask;
console.log("chat.clienttasks",newTask)
    // Add the new tasks as a single sub-array in clienttasks
   // chat.clienttasks.push(newTask);

    // Save the updated chat document
    const updatedChat = await chat.save();

    // console.log("Client tasks updated successfully.");
    res.status(200).json({
      message: "Client tasks updated successfully",
      updatedChat,
    });
  } catch (error) {
    console.error("Error updating client tasks:", error.message);
    res
      .status(500)
      .json({ message: "Error updating client tasks", error: error.message });
  }
};

//update task client
//const updateTaskCheckedStatus = async (req, res) => {
 // const { chatId, taskUpdates } = req.body;
  // console.log(req.body);
  // taskUpdates should be an array of objects, e.g., [{ id: "1", checked: true }, { id: "2", checked: false }]
 // try {
    // Find the chat document
 //   const chat = await AccountwiseChat.findById(chatId);
  //  if (!chat) {
     // return res.status(404).json({ message: "Chat not found" });
  //  }

    // Iterate through the clienttasks array and update the checked property
  //  chat.clienttasks = chat.clienttasks.map((subArray) =>
   //   subArray.map((task) => {
      //  const update = taskUpdates.find((update) => update.id === task.id);
      //  if (update) {
      //    return { ...task, checked: update.checked }; // Update the checked property
      //  }
       // return task; // Return the task as is if no update is found
    //  })
  //  );

    // Save the updated document
  //  const updatedChat = await chat.save();

    // console.log("Task(s) updated successfully.");
  //  res.status(200).json({
    //  message: "Task(s) updated successfully",
    //  updatedChat,
   // });
 // } catch (error) {
  //  console.error("Error updating task(s):", error.message);
  //  res
     // .status(500)
     // .json({ message: "Error updating task(s)", error: error.message });
 // }
//};
//const updateTaskCheckedStatus = async (req, res) => {
 // const { chatId, taskUpdates } = req.body;

 // try {
  //  const chat = await AccountwiseChat.findById(chatId);
  //  if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Loop through parent arrays and inner tasks
  //  chat.clienttasks = chat.clienttasks.map(taskGroup =>
   //   taskGroup.map(task => {
   //    const update = taskUpdates.find(u => u.id === task.id);
    //   return update ? { ...task, checked: update.checked } : task;
   //  })
  // );
 // If clienttasks is a flat array
   
   // const updatedChat = await chat.save();

  //  res.status(200).json({
    //  message: "Task(s) updated successfully",
   //   updatedChat,
  //  });

 // } catch (error) {
 //   console.error("Error updating task(s):", error.message);
 //   res.status(500).json({
  //    message: "Error updating task(s)",
  //    error: error.message,
 //   });
 // }
//};
const updateTaskCheckedStatus = async (req, res) => {
  try {
    const { chatId, taskUpdates } = req.body;

    if (!chatId || !taskUpdates || !Array.isArray(taskUpdates)) {
      return res.status(400).json({ message: "Invalid request payload" });
    }

    // Find Chat
    const chat = await AccountwiseChat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Update tasks
    chat.clienttasks = chat.clienttasks.map(task => {
      const updatedTask = taskUpdates.find(t => t.id === task.id);
      if (updatedTask) {
        task.checked = updatedTask.checked !== undefined ? updatedTask.checked : task.checked;
        task.text = updatedTask.text ?? task.text;
      }
      return task;
    });

    const updatedChat = await chat.save();

    return res.status(200).json({
      message: "Task(s) updated successfully",
     // clienttasks: updatedChat.clienttasks,
      updatedChat,
    });

  } catch (error) {
    console.error("Error updating task(s):", error);
    return res.status(500).json({
      message: "Internal Server Error while updating tasks",
      error: error.message,
    });
  }
};


const getUnreadChatsWithLatestMessage = async (req, res) => {
  try {
    const unreadChats = await AccountwiseChat.find({
      chatstatus: false,
    })
      .populate({ path: "accountid", model: "clientAccount" })
     // .populate({ path: "description.senderid", model: "User" });

    const chatsWithLatestMessage = [];

    for (const chat of unreadChats) {
      const account = await Accounts.findById(chat.accountid._id).populate(
        "contacts"
      );

      if (!account) continue;

     
      const currentDate = new Date();
      const placeholderValues = {
        ACCOUNT_NAME: account.accountName || "",
               CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
        CURRENT_DAY_NUMBER: new Date().getDate(),
        CURRENT_DAY_NAME: new Date().toLocaleString("default", {
          weekday: "long",
        }),
        CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
        CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
          month: "long",
        }),
        CURRENT_YEAR: new Date().getFullYear(),
        LAST_DAY_FULL_DATE: lastDayFullDate,
        LAST_DAY_NUMBER: lastDayNumber,
        LAST_DAY_NAME: lastDayName,
        LAST_WEEK: lastWeek,
        LAST_MONTH_NUMBER: lastMonthNumber,
        LAST_MONTH_NAME: lastMonthName,
        LAST_QUARTER: lastQuarter,
        LAST_YEAR: lastYear,
        NEXT_DAY_FULL_DATE: nextDayFullDate,
        NEXT_DAY_NUMBER: nextDayNumber,
        NEXT_DAY_NAME: nextDayName,
        NEXT_WEEK: nextWeek,
        NEXT_MONTH_NUMBER: nextMonthNumber,
        NEXT_MONTH_NAME: nextMonthName,
        NEXT_QUARTER: nextQuarter,
        NEXT_YEAR: nextYear,
      };

      const replacePlaceholders = (template, data) => {
        return template.replace(
          /\[([\w\s]+)\]/g,
          (match, key) => data[key.trim()] || ""
        );
      };

      // Replace placeholders in chatsubject
      const processedSubject = replacePlaceholders(
        chat.chatsubject || "",
        placeholderValues
      );

      // Get latest message
      const latestMessageRaw = chat.description?.length
        ? chat.description.reduce((latest, current) =>
            new Date(current.time) > new Date(latest.time) ? current : latest
          )
        : null;

      // Replace placeholders in latest message (if exists)
      const latestMessage = latestMessageRaw
        ? {
            ...latestMessageRaw,
            message: replacePlaceholders(
              latestMessageRaw.message || "",
              placeholderValues
            ),
          }
        : null;

      chatsWithLatestMessage.push({
        _id: chat._id,
        accountid: chat.accountid,
        chatsubject: processedSubject,
        latestMessage,
        clienttasks: chat.clienttasks,
      });
    }

    res.status(200).json({
      message: "Unread chats with latest message retrieved successfully",
      chats: chatsWithLatestMessage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getUnreadChatsByAccountId = async (req, res) => {
//   try {
//     const { accountid } = req.params;

//     if (!accountid) {
//       return res.status(400).json({ error: "accountid is required in params" });
//     }

//     const unreadChats = await AccountwiseChat.find({
//       "description.isRead": false,
//       accountid: accountid,
//     })
//       .populate({ path: "accountid", model: "Accounts" })
//       .populate({ path: "description.senderid", model: "User" });

//     const chatsWithLatestMessage = [];

//     for (const chat of unreadChats) {
//       const account = await Accounts.findById(chat.accountid._id).populate("contacts");
//       if (!account) continue;

//       const validContact = account.contacts.filter((contact) => contact.login);

//       const placeholderValues = {
//         ACCOUNT_NAME: account.accountName || "",
//         FIRST_NAME: validContact[0]?.firstName || "",
//         MIDDLE_NAME: validContact[0]?.middleName || "",
//         LAST_NAME: validContact[0]?.lastName || "",
//         CONTACT_NAME: validContact[0]?.contactName || "",
//         COMPANY_NAME: validContact[0]?.companyName || "",
//         COUNTRY: validContact[0]?.country || "",
//         STREET_ADDRESS: validContact[0]?.streetAddress || "",
//         STATEPROVINCE: validContact[0]?.state || "",
//         PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
//         ZIPPOSTALCODE: validContact[0]?.postalCode || "",
//         CITY: validContact[0]?.city || "",
//         CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
//         CURRENT_DAY_NUMBER: new Date().getDate(),
//         CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
//         CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
//         CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
//         CURRENT_YEAR: new Date().getFullYear(),
//         // Optionally: handle LAST_*, NEXT_* placeholders as in original code
//       };

//       const replacePlaceholders = (template, data) => {
//         return template.replace(/\[([\w\s]+)\]/g, (match, key) => data[key.trim()] || "");
//       };

     
//       const latestMessageRaw = chat.description?.length
//         ? chat.description.reduce((latest, current) =>
//             new Date(current.time) > new Date(latest.time) ? current : latest
//           )
//         : null;

//       const latestMessage = latestMessageRaw
//         ? {
//             ...latestMessageRaw,
//             message: replacePlaceholders(latestMessageRaw.message || "", placeholderValues),
//           }
//         : null;

//       chatsWithLatestMessage.push({
//         _id: chat._id,
//         accountid: chat.accountid,
//         // chatsubject: processedSubject,
//         latestMessage,
//         // clienttasks: chat.clienttasks,
//       });
//     }

//     res.status(200).json({
//       message: "Unread chats for the account retrieved successfully",
//       chats: chatsWithLatestMessage,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const getUnreadChatsByAccountId = async (req, res) => {
  try {
    const { accountid } = req.params;

    if (!accountid) {
      return res.status(400).json({ error: "accountid is required in params" });
    }

    const unreadChats = await AccountwiseChat.find({
      "description.isRead": false,
      accountid: accountid,
    })
      .populate({ path: "accountid", model: "clientAccount" })
      //.populate({ path: "description.senderid", model: "User" });

    const chatsWithLatestMessage = [];

    for (const chat of unreadChats) {
      const account = await Accounts.findById(chat.accountid._id).populate("contacts");
      if (!account) continue;

            const placeholderValues = {
        ACCOUNT_NAME: account.accountName || "",
               CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
        CURRENT_DAY_NUMBER: new Date().getDate(),
        CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
        CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
        CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
        CURRENT_YEAR: new Date().getFullYear(),
      };

      const replacePlaceholders = (template, data) => {
        return template.replace(/\[([\w\s]+)\]/g, (match, key) => data[key.trim()] || "");
      };

      const latestMessageRaw = chat.description?.length
        ? chat.description.reduce((latest, current) =>
            new Date(current.time) > new Date(latest.time) ? current : latest
          )
        : null;

      if (latestMessageRaw) {
        chatsWithLatestMessage.push({
          accountid: chat.accountid._id,
          isRead:false,
           senderName: latestMessageRaw.senderid?.username || "Unknown",
           fromwhome: latestMessageRaw.fromwhome || "Unknown",
          message: replacePlaceholders(latestMessageRaw.message || "", placeholderValues),
        });
      }
    }

    res.status(200).json({
      message: "Unread chats for the account retrieved successfully",
      chats: chatsWithLatestMessage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateChatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Chat Accountwise ID" });
    }

    // Update the chatstatus field to true
    const updatedChatStatus = await AccountwiseChat.findByIdAndUpdate(
      { _id: id },
      { chatstatus: true }, // Set chatstatus to true
      { new: true }
    );

    if (!updatedChatStatus) {
      return res.status(404).json({ error: "No such Chat Accountwise" });
    }

    res
      .status(200)
      .json({ message: "Chat status updated to true", updatedChatStatus });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// const getUnreadMessages = async (req, res) => {
//   try {
//     const { accountid, fromwhome } = req.params;
    
//     // Validate fromwhome parameter
//     if (fromwhome !== 'client' && fromwhome !== 'Admin') {
//       return res.status(400).json({ error: "Invalid 'fromwhome' parameter. Must be 'Client' or 'Admin'" });
//     }

//     // Find all chats for the account
//     const chats = await AccountwiseChat.find({
//       accountid: accountid,
//       active: true
//     })
//       .populate({ path: "accountid", model: "Accounts" })
//       .populate({ path: "description.senderid", model: "User" });

//     if (!chats || chats.length === 0) {
//       return res.status(404).json({ error: "No chats found for this account" });
//     }

//     // Get account details for placeholder replacement
//     const account = await Accounts.findById(accountid).populate("contacts");
//     if (!account) {
//       return res.status(404).json({ error: "Account not found" });
//     }

//     const validContact = account.contacts.filter((contact) => contact.login);

//     // Prepare placeholder values
//     const placeholderValues = {
//       ACCOUNT_NAME: account.accountName || "",
//       FIRST_NAME: validContact[0]?.firstName || "",
//       MIDDLE_NAME: validContact[0]?.middleName || "",
//       LAST_NAME: validContact[0]?.lastName || "",
//       CONTACT_NAME: validContact[0]?.contactName || "",
//       COMPANY_NAME: validContact[0]?.companyName || "",
//       COUNTRY: validContact[0]?.country || "",
//       STREET_ADDRESS: validContact[0]?.streetAddress || "",
//       STATEPROVINCE: validContact[0]?.state || "",
//       PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
//       ZIPPOSTALCODE: validContact[0]?.postalCode || "",
//       CITY: validContact[0]?.city || "",
//       CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
//       CURRENT_DAY_NUMBER: new Date().getDate(),
//       CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
//       CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
//       CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
//       CURRENT_YEAR: new Date().getFullYear(),
//     };

//     // Function to replace placeholders
//     const replacePlaceholders = (template, data) => {
//       return template.replace(/\[([\w\s]+)\]/g, (match, key) => data[key.trim()] || "");
//     };

//     // Collect all unread messages in a single array
//     const allUnreadMessages = [];
    
//     chats.forEach(chat => {
//       if (chat.description && Array.isArray(chat.description)) {
//         chat.description.forEach(message => {
//           if (message.fromwhome === fromwhome && message.isRead === false) {
//             // Replace placeholders
//             const processedChatSubject = replacePlaceholders(chat.chatsubject || "", placeholderValues);
//             const processedMessage = replacePlaceholders(message.message || "", placeholderValues);

//             allUnreadMessages.push({
//               chatId: chat._id,
//               chatSubject: processedChatSubject,
//               messageId: message._id,
//               message: processedMessage,
//               sender: message.senderid,
//               time: message.time,
//               fromwhome: message.fromwhome,
//               isRead: message.isRead
//             });
//           }
//         });
//       }
//     });

//     // Sort all messages by time (oldest first)
//     allUnreadMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

//     res.status(200).json({
//       message: `All unread messages from ${fromwhome} retrieved successfully`,
//       count: allUnreadMessages.length,
//       unreadMessages: allUnreadMessages
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const getUnreadMessages = async (req, res) => {
  try {
    const { accountid, fromwhome } = req.params;
    
    // Validate fromwhome parameter
    if (fromwhome !== 'client' && fromwhome !== 'Admin') {
      return res.status(400).json({ error: "Invalid 'fromwhome' parameter. Must be 'Client' or 'Admin'" });
    }

    // Find all chats for the account
    const chats = await AccountwiseChat.find({
      accountid: accountid,
      active: true
    })
      .populate({ path: "accountid", model: "clientAccount" })
     // .populate({ path: "description.senderid", model: "User" });

    if (!chats || chats.length === 0) {
      return res.status(404).json({ error: "No chats found for this account" });
    }

    // Get account details for placeholder replacement
    const account = await Accounts.findById(accountid).populate("contacts");
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

   
    // Prepare placeholder values
    const placeholderValues = {
      ACCOUNT_NAME: account.accountName || "",
           CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
      CURRENT_DAY_NUMBER: new Date().getDate(),
      CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
      CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
      CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
      CURRENT_YEAR: new Date().getFullYear(),
    };

    // Function to replace placeholders
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, key) => data[key.trim()] || "");
    };

    // Group messages by chatId
    const groupedMessages = {};
    
    chats.forEach(chat => {
      if (chat.description && Array.isArray(chat.description)) {
        const processedChatSubject = replacePlaceholders(chat.chatsubject || "", placeholderValues);
        
        chat.description.forEach(message => {
          if (message.fromwhome === fromwhome && message.isRead === false) {
            const processedMessage = replacePlaceholders(message.message || "", placeholderValues);
            
            if (!groupedMessages[chat._id]) {
              groupedMessages[chat._id] = {
                chatId: chat._id,
                chatSubject: processedChatSubject,
                messages: []
              };
            }
            
            groupedMessages[chat._id].messages.push({
              messageId: message._id,
              message: processedMessage,
              sender: message.senderid,
              time: message.time,
              fromwhome: message.fromwhome,
              isRead: message.isRead
            });
          }
        });
      }
    });

    // Convert to array and sort messages within each chat by time
    const result = Object.values(groupedMessages).map(chat => ({
      ...chat,
      messages: chat.messages.sort((a, b) => new Date(a.time) - new Date(b.time)),
      unreadCount: chat.messages.length
    }));

    // Sort chats by the time of their most recent message (newest first)
    result.sort((a, b) => {
      const aLatest = new Date(a.messages[a.messages.length - 1]?.time || 0);
      const bLatest = new Date(b.messages[b.messages.length - 1]?.time || 0);
      return bLatest - aLatest;
    });

    const totalUnreadCount = result.reduce((sum, chat) => sum + chat.unreadCount, 0);

    res.status(200).json({
      message: `Unread messages from ${fromwhome} retrieved successfully`,
      count: totalUnreadCount,
      chats: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markMessageAsRead = async (req, res) => {
  // Validate request parameters
  

  try {
    const { chatId, messageId } = req.params;

    // Find and update the specific message
    const updatedChat = await AccountwiseChat.findOneAndUpdate(
      {
        _id: chatId,
        'description._id': messageId,
        'description.isRead': false // Only update if currently unread
      },
      {
        $set: { 'description.$.isRead': true, 'description.$.readAt': new Date() }
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate({
      path: 'description.senderid',
      select: 'username email role'
    });

    if (!updatedChat) {
      return res.status(404).json({ 
        success: false,
        message: "Message not found or already read"
      });
    }

    // Extract the updated message
    const updatedMessage = updatedChat.description.find(
      msg => msg._id.toString() === messageId
    );

    res.status(200).json({
      success: true,
      data: {
        chatId: updatedChat._id,
        messageId: updatedMessage._id,
        isRead: updatedMessage.isRead,
        readAt: updatedMessage.readAt,
        fromwhome: updatedMessage.fromwhome,
        sender: updatedMessage.senderid
      }
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


const markAllMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Update all messages in the specified chat
    const result = await AccountwiseChat.updateOne(
      {
        _id: chatId // Using chatId as the document _id
      },
      {
        $set: {
          'description.$[].isRead': true, // Update all messages in the array
          
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or no messages to update"
      });
    }

    res.status(200).json({
      success: true,
      message: `Marked all messages as read in chat ${chatId}`,
      data: {
        chatId,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const updateChatFromClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDescriptions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Chat ID" });
    }

    if (!Array.isArray(newDescriptions) || newDescriptions.length === 0) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Step 1: Fetch chat as lean object
    const chat = await AccountwiseChat.findById(id)
      .populate({
        path: "accountid",
        model: "clientAccount",
        populate: {
          path: "adminUserId",
          model: "User",
          select: "emailSyncEmail email username"
        }
      })
      .lean();

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Step 2: Update description field directly using $push
    await AccountwiseChat.findByIdAndUpdate(id, {
      $push: { description: { $each: newDescriptions } }
    });

    // Step 3: Fetch associated account and contacts
    const account = await Accounts.findById(chat.accountid._id).populate("contacts");

    if (!account) {
      return res.status(404).json({ error: "Associated account not found" });
    }

   
    const placeholderValues = {
      ACCOUNT_NAME: account.accountName || "",
           CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
      CURRENT_DAY_NUMBER: new Date().getDate(),
      CURRENT_DAY_NAME: new Date().toLocaleString("default", {
        weekday: "long",
      }),
      CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
      CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
        month: "long",
      }),
      CURRENT_YEAR: new Date().getFullYear(),
      LAST_DAY_FULL_DATE: lastDayFullDate,
      LAST_DAY_NUMBER: lastDayNumber,
      LAST_DAY_NAME: lastDayName,
      LAST_WEEK: lastWeek,
      LAST_MONTH_NUMBER: lastMonthNumber,
      LAST_MONTH_NAME: lastMonthName,
      LAST_QUARTER: lastQuarter,
      LAST_YEAR: lastYear,
      NEXT_DAY_FULL_DATE: nextDayFullDate,
      NEXT_DAY_NUMBER: nextDayNumber,
      NEXT_DAY_NAME: nextDayName,
      NEXT_WEEK: nextWeek,
      NEXT_MONTH_NUMBER: nextMonthNumber,
      NEXT_MONTH_NAME: nextMonthName,
      NEXT_QUARTER: nextQuarter,
      NEXT_YEAR: nextYear,
    };

    // Replace placeholders in subject
    const replacePlaceholders = (template, data) => {
      return template.replace(
        /\[([\w\s]+)\]/g,
        (match, key) => data[key.trim()] || ""
      );
    };

    const clientMessage = newDescriptions[0]?.message || "No content";
    const subject =
      replacePlaceholders(chat.chatsubject || "", placeholderValues) ||
      "New Chat Message";
    const accountName = chat.accountid?.accountName || "Unknown Account";
    const clientId = chat.accountid?._id;
    const adminEmail =
      chat.accountid?.adminUserId?.emailSyncEmail ||
      chat.accountid?.adminUserId?.email ||
      null; // <-- fallback check
console.log("account",adminEmail)
    // Step 5: Send email only if adminEmail is present
    if (adminEmail) {
      await transporter.sendMail({
        from: `<${process.env.EMAIL}>`,
        to: adminEmail,
        subject: `#${clientId} New message ${subject} from ${accountName}`,
        html: `
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Account:</strong> ${accountName}</p>
          <p><strong>Message:</strong><br/>${clientMessage}</p>
        `,
      });
    }

    res.status(200).json({
      message: adminEmail
        ? "Message saved and email sent to admin"
        : "Message sent ",
      updatedChat: {
        _id: id,
        newDescriptions,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
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
  addClientTask,
  updateTaskCheckedStatus,
  getUnreadChatsWithLatestMessage,
  updateChatStatus,
  getUnreadChatsByAccountId,
  getUnreadMessages,
   markMessageAsRead,
  markAllMessagesAsRead, updateChatFromClient,createChatsForAdmin 
};

const mongoose = require("mongoose");
const User = require("../models/userModel");
const Tags = require("../models/tagsModel");
const Accounts = require("../models/AccountModel");
const Task = require("../models/accountTasksModel");
const Pipeline = require("../models/pipelineTemplateModel");
const Job = require("../models/JobModel");
const Contacts = require("../models/contactsModel");
const TaskTemplate = require("../models/taskTemplateModel")
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Get the current date
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

//get all JobTemplate
const getAllTasks = async (req, res) => {
  try {
    const task = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "Task retrieved successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// //POST a new task
// const createTask = async (req, res) => {
//   const {
//     accounts,
//     job,
//     templatename,
//     taskname,
//     status,
//     taskassignees,
//     priority,
//     description,
//     tasktags,
//     issubtaskschecked,
//     startdate,
//     enddate,
//     subtasks,
//     active,
//   } = req.body;

//   try {
//     const newTask = await Task.create({
//       accounts,
//       job,
//       templatename,
//       taskname,
//       status,
//       taskassignees,
//       priority,
//       description,
//       tasktags,
//       issubtaskschecked,
//       startdate,
//       enddate,
//       subtasks,
//       active,
//     });

//     return res
//       .status(201)
//       .json({ message: "Task created successfully", newTask });
//   } catch (error) {
//     console.error("Error creating Job:", error);
//     return res.status(500).json({ error: "Error creating Job" });
//   }
// };

const nodemailer = require("nodemailer");
// const Task = require("../models/Task"); // Adjust the path as needed

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // Use STARTTLS
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        },
      });

// POST a new task
// const createTask = async (req, res) => {
//   const {
//     accounts,
//     job,
//     templatename,
//     taskname,
//     status,
//     taskassignees,
//     priority,
//     description,
//     tasktags,
//     issubtaskschecked,
//     startdate,
//     enddate,
//     subtasks,
//     active,
//   } = req.body;

//   try {
//     // Create Task
//     const newTask = await Task.create({
//       accounts,
//       job,
//       templatename,
//       taskname,
//       status,
//       taskassignees,
//       priority,
//       description,
//       tasktags,
//       issubtaskschecked,
//       startdate,
//       enddate,
//       subtasks,
//       active,
//     });

//     // Fetch emails of task assignees
//     const users = await User.find({ _id: { $in: taskassignees } }, "email");

//     const recipientEmails = users
//       .map((user) => user.email)
//       .filter((email) => email) // Ensure emails are not undefined
//       .join(",");

//     if (!recipientEmails) {
//       console.warn("No valid emails found for task assignees.");
//       return res
//         .status(201)
//         .json({ message: "Task created, but no valid emails found", newTask });
//     }

//     // Email setup
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: recipientEmails,
//       subject: `New Task Assigned: ${taskname}`,
//       html: `
//         <h3>Hello,</h3>
//         <p>A new task has been assigned to you:</p>
//         <ul>
//           <li><strong>Account:</strong> ${accounts}</li>
//           <li><strong>Task Name:</strong> ${taskname}</li>
//           <li><strong>Status:</strong> ${status}</li>
//           <li><strong>Start Date:</strong> ${startdate}</li>
//           <li><strong>End Date:</strong> ${enddate}</li>
//         </ul>
//         <p>Please log in to check the details.</p>
//         <p>Best Regards,</p>
//         <p>Your Team</p>
//       `,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to: ${recipientEmails}`);

//     return res.status(201).json({ message: "Task created successfully", newTask });
//   } catch (error) {
//     console.error("Error creating Task or sending email:", error);
//     return res.status(500).json({ error: "Error creating Task or sending email" });
//   }
// };

const createTask = async (req, res) => {
  const {
    accounts,
    job,
    templatename,
    taskname,
    status,
    taskassignees,
    priority,
    description,
    tasktags,
    issubtaskschecked,
    startdate,
    enddate,
    subtasks,
    active,
  } = req.body;

  try {
    // Create Task
    const newTask = await Task.create({
      accounts,
      job,
      templatename,
      taskname,
      status,
      taskassignees,
      priority,
      description,
      tasktags,
      issubtaskschecked,
      startdate,
      enddate,
      subtasks,
      active,
    });

    // Fetch account names instead of IDs
    const accountData = await Accounts.find({ _id: { $in: accounts } }, "accountName");
    const accountNames = accountData.map((acc) => acc.accountName);

    // Fetch emails of task assignees
    const users = await User.find({ _id: { $in: taskassignees } }, "email");
    const recipientEmails = users.map((user) => user.email).filter((email) => email).join(",");


    if (!recipientEmails) {
      console.warn("No valid emails found for task assignees.");
      return res
        .status(201)
        .json({ message: "Task created, but no valid emails found", newTask });
    }
// Format dates as MM-DD-YYYY
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formattedStartDate = formatDate(startdate);
const formattedEndDate = formatDate(enddate);
 
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmails,
      subject: `Task Assigned: ${taskname}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <div style="background-color: #007bff; color: #ffffff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New Task Assigned</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
         
          <p style="font-size: 14px; color: #555;">You have been assigned a new task. Please find the details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Account:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${accountNames}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${taskname}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${status}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${priority}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedStartDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>End Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedEndDate}</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #555; margin-top: 15px;">Please log in to your account to view and manage the task.</p>
         
          <p style="font-size: 14px; color: #555; margin-top: 20px;">Best Regards,</p>
          <p style="font-size: 14px; color: #333;"><strong>Your Team</strong></p>
        </div>
      </div>
      `,
    };
    

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${recipientEmails}`);

    return res.status(201).json({ message: "Task created successfully", newTask });
  } catch (error) {
    console.error("Error creating Task or sending email:", error);
    return res.status(500).json({ error: "Error creating Task or sending email" });
  }
};




// gets tasks list
// const getTaskList = async (req, res) => {
//   try {
//     const { isActive ,status } = req.params;
//     const query = { active: isActive };
//     if (status !== "all") {
//       query.status = { $ne: "Completed" }; // Exclude "Completed" tasks unless "all" is requested
//     }
//     const tasks = await Task.find(query)

//       .populate({ path: "accounts", model: "Accounts" })
//       .populate({
//         path: "job",
//         model: "Job",
//         populate: {
//           path: "pipeline",
//           model: "pipeline",
//           populate: { path: "stages", model: "Stage" },
//         },
//       })
//       .populate({ path: "tasktags", model: "Tags" })
//       .populate({ path: "taskassignees", model: "User" })
//       .sort({ createdAt: -1 });

//     const taskList = [];

//     for (const task of tasks) {
//       const job = task.job;
//       if (!job) continue;

//       const pipeline = await Pipeline.findById(job.pipeline);
//       if (!pipeline) continue;

//       // Extract Pipeline details (Separate fields)
//       const pipelineId = task.job.pipeline._id;
//       const pipelineName = task.job.pipeline.pipelineName || "";

//       const assigneeNames = task.taskassignees.map((assignee) => assignee.username);

//       // Extract tags data
//       const tagsData = task.tasktags.map((tag) => ({
//         id: tag._id,
//         tagName: tag.tagName,
//         tagColour: tag.tagColour,
//       }));

//       // Extract Stage Names & IDs (Separate fields)
//       let stageIds = [];
//       let stageNames = [];
//       if (task.job.stageid) {
//         if (Array.isArray(task.job.stageid)) {
//           task.job.stageid.forEach((stageId) => {
//             const matchedStage = task.job.pipeline.stages.find((stage) =>
//               stage._id.equals(stageId)
//             );
//             if (matchedStage) {
//               stageIds.push(matchedStage._id);
//               stageNames.push(matchedStage.name);
//             }
//           });
//         } else {
//           const matchedStage = task.job.pipeline.stages.find((stage) =>
//             stage._id.equals(task.job.stageid)
//           );
//           if (matchedStage) {
//             stageIds.push(matchedStage._id);
//             stageNames.push(matchedStage.name);
//           }
//         }
//       }
//       // Get subtasks count
//       const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
//       const checkedSubtasks = task.subtasks
//         ? task.subtasks.filter((subtask) => subtask.checked).length
//         : 0;
//       const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`; // Format checked/total

//       // Fetch account and associated contacts
//       const account = await Accounts.findById(job.accounts).populate(
//         "contacts"
//       );

//       // console.log(account)
//       const validContact = account.contacts.filter((contact) => contact.login);
//       // console.log(validContact)
//       // Define placeholder values
//       const placeholderValues = {
        // ACCOUNT_NAME: account?.accountName || "",
        // FIRST_NAME: validContact[0]?.firstName || "",
        // MIDDLE_NAME: validContact[0]?.middleName || "",
        // LAST_NAME: validContact[0]?.lastName || "",
        // CONTACT_NAME: validContact[0]?.contactName || "",
        // COMPANY_NAME: validContact[0]?.companyName || "",
        // COUNTRY: validContact[0]?.country || "",
        // STREET_ADDRESS: validContact[0]?.streetAddress || "",
        // STATEPROVINCE: validContact[0]?.state || "",
        // PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
        // ZIPPOSTALCODE: validContact[0]?.postalCode || "",
        // CITY: validContact[0]?.city || "",
        // CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
        // CURRENT_DAY_NUMBER: currentDate.getDate(),
        // CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
        //   weekday: "long",
        // }),
        // CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
        // CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
        //   month: "long",
        // }),
        // CURRENT_YEAR: currentDate.getFullYear(),
        // LAST_DAY_FULL_DATE: lastDayFullDate,
        // LAST_DAY_NUMBER: lastDayNumber,
        // LAST_DAY_NAME: lastDayName,
        // LAST_WEEK: lastWeek,
        // LAST_MONTH_NUMBER: lastMonthNumber,
        // LAST_MONTH_NAME: lastMonthName,
        // LAST_QUARTER: lastQuarter,
        // LAST_YEAR: lastYear,
        // NEXT_DAY_FULL_DATE: nextDayFullDate,
        // NEXT_DAY_NUMBER: nextDayNumber,
        // NEXT_DAY_NAME: nextDayName,
        // NEXT_WEEK: nextWeek,
        // NEXT_MONTH_NUMBER: nextMonthNumber,
        // NEXT_MONTH_NAME: nextMonthName,
        // NEXT_QUARTER: nextQuarter,
        // NEXT_YEAR: nextYear,
//         // Add other dynamic placeholders as required
//       };

//       // Function to replace placeholders in text
//       const replacePlaceholders = (template, data) => {
//         return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
//           return data[placeholder.trim()] || "";
//         });
//       };

//       // // Extract Job details (Separate fields)
//       const jobId = task.job._id;
//       const jobName = replacePlaceholders(
//         task.job.jobname || "",
//         placeholderValues
//       );
//       // task.job.jobname || ""
//       // job.jobname = replacePlaceholders(job.jobname || '', placeholderValues);

//       taskList.push({
//         id: task._id,
//         Name: task.taskname,
//         JobID: jobId, // Job ID (Separate)
//         JobName: jobName, // Job Name (Separate)
//         PipelineId: pipelineId, // Pipeline ID (Separate)
//         PipelineName: pipelineName, // Pipeline Name (Separate)
//         StageIds: stageIds, // Array of Stage IDs
//         StageNames: stageNames, // Array of Stage Names/ Includes array of Stage IDs and Names
//         Assignees: assigneeNames,
//         TaskTags: tagsData,
//         AccountName: task.accounts.accountName,
//         AccountId: task.accounts._id,
//         StartDate: task.startdate,
//         EndDate: task.enddate,
//         Priority: task.priority,
//         Description: task.description,
//         Status: task.status,
//         SubtaskCount: subtaskCount,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//       });
//     }

//     res.status(200).json({ message: "Tasks retrieved successfully", taskList });
//     // console.log("tasks list", taskList);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getTaskList = async (req, res) => {
  try {
    const { isActive, status } = req.params;
    const query = { active: isActive };
    if (status !== "all") {
      query.status = { $ne: "Completed" }; // Exclude "Completed" tasks unless "all" is requested
    }

    const tasks = await Task.find(query)
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "job",
        model: "Job",
        populate: {
          path: "pipeline",
          model: "pipeline",
          populate: { path: "stages", model: "Stage" },
        },
      })
      .populate({ path: "tasktags", model: "Tags" })
      .populate({ path: "taskassignees", model: "User" })
      .sort({ createdAt: -1 });

    const taskList = [];

    for (const task of tasks) {
      const job = task.job || null; // Handle missing job
      let pipelineId = null;
      let pipelineName = "";
      let stageIds = [];
      let stageNames = [];

      if (job) {
        const pipeline = job.pipeline || null;

        if (pipeline) {
          pipelineId = pipeline._id;
          pipelineName = pipeline.pipelineName || "";

          if (job.stageid) {
            const jobStageIds = Array.isArray(job.stageid) ? job.stageid : [job.stageid];

            jobStageIds.forEach((stageId) => {
              const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
              if (matchedStage) {
                stageIds.push(matchedStage._id);
                stageNames.push(matchedStage.name);
              }
            });
          }
        }
      }

      const assigneeNames = task.taskassignees.map((assignee) => assignee.username);

      // Extract tags data
      const tagsData = task.tasktags.map((tag) => ({
        id: tag._id,
        tagName: tag.tagName,
        tagColour: tag.tagColour,
      }));

      // Get subtasks count
      const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
      const checkedSubtasks = task.subtasks
        ? task.subtasks.filter((subtask) => subtask.checked).length
        : 0;
      const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`;

      // Fetch account and associated contacts
      let accountName = "";
      let accountId = null;
      let placeholderValues = {};

      if (task.accounts) {
        const account = await Accounts.findById(task.accounts).populate("contacts");

        if (account) {
          accountName = account.accountName || "";
          accountId = account._id;
        

          placeholderValues = {
            ACCOUNT_NAME: account?.accountName || "",
                       CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
            CURRENT_DAY_NUMBER: currentDate.getDate(),
            CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
              weekday: "long",
            }),
            CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
            CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
              month: "long",
            }),
            CURRENT_YEAR: currentDate.getFullYear(),
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
        }
      }

      // Function to replace placeholders in text
      const replacePlaceholders = (template, data) => {
        return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
          return data[placeholder.trim()] || "";
        });
      };

      const jobId = job ? job._id : null;
      const jobName = replacePlaceholders(job?.jobname || "", placeholderValues);

      taskList.push({
        id: task._id,
        Name: task.taskname,
        JobID: jobId, // Can be null
        JobName: jobName || "", // Can be empty string
        PipelineId: pipelineId, // Can be null
        PipelineName: pipelineName, // Can be empty string
        StageIds: stageIds, // Can be empty array
        StageNames: stageNames, // Can be empty array
        Assignees: assigneeNames,
        TaskTags: tagsData,
        AccountName: accountName, // Can be empty string
        AccountId: accountId, // Can be null
        StartDate: task.startdate,
        EndDate: task.enddate,
        Priority: task.priority,
        Description: task.description,
        Status: task.status,
        SubtaskCount: subtaskCount,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }

    res.status(200).json({ message: "Tasks retrieved successfully", taskList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single ServiceTemplate
const getsTaskById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Task ID" });
  }
  try {
    const accountTasks = await Task.findById(id);
    if (!accountTasks) {
      return res.status(404).json({ error: "No such Task" });
    }

    res
      .status(200)
      .json({ message: "Task retrieved successfully", accountTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete task

const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const deletedTask = await Task.findByIdAndDelete({ _id: id });
    if (!deletedTask) {
      return res.status(404).json({ error: "No such Task" });
    }
    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update a task
// const updateTasks = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "Invalid Task ID" });
//   }

//   try {
//     const updatedTask = await Task.findOneAndUpdate(
//       { _id: id },
//       { ...req.body },
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ error: "No such Task" });
//     }

//     res.status(200).json({ message: "Task Updated successfully", updatedTask });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

const updateTasks = async (req, res) => {
  const { id } = req.params;
  const {
    taskassignees, taskname, status, priority, startdate, enddate, accounts
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Task ID" });
  }

  try {
    // Retrieve the existing task before updating
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ error: "No such Task" });
    }

    // Find new assignees (users who were not in the previous list)
    const previousAssignees = existingTask.taskassignees.map(String);
    const newAssignees = taskassignees.filter((assignee) => !previousAssignees.includes(String(assignee)));

    // Update the task
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "No such Task" });
    }

    // Fetch emails of new task assignees
    if (newAssignees.length > 0) {
      const users = await User.find({ _id: { $in: newAssignees } }, "email");
      const recipientEmails = users.map((user) => user.email).filter(Boolean).join(",");

      if (recipientEmails) {
        // Fetch account names
        const accountData = await Accounts.find({ _id: { $in: accounts } }, "accountName");
        const accountNames = accountData.map((acc) => acc.accountName);

        // Format dates as MM-DD-YYYY
        const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        const formattedStartDate = formatDate(startdate);
        const formattedEndDate = formatDate(enddate);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipientEmails,
          subject: `Task Assigned: ${taskname}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <div style="background-color: #007bff; color: #ffffff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">New Task Assigned</h2>
            </div>
            <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
              <p style="font-size: 14px; color: #555;">You have been assigned a new task. Please find the details below:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Account:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${accountNames}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${taskname}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${priority}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedStartDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>End Date:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedEndDate}</td>
                </tr>
              </table>
              <p style="font-size: 14px; color: #555; margin-top: 15px;">Please log in to your account to view and manage the task.</p>
              <p style="font-size: 14px; color: #555; margin-top: 20px;">Best Regards,</p>
              <p style="font-size: 14px; color: #333;"><strong>Your Team</strong></p>
            </div>
          </div>
          `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to new assignees: ${recipientEmails}`);
      }
    }

    return res.status(200).json({ message: "Task Updated successfully", updatedTask });
  } catch (error) {
    console.error("Error updating Task or sending email:", error);
    return res.status(500).json({ error: "Error updating Task or sending email" });
  }
};

//Get a single ServiceTemplate

// const getsTaskListById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const task = await Task.findById(id)
//       .populate({ path: "accounts", model: "Accounts" })
//       .populate({
//         path: "job",
//         model: "Job"
        
//       }).populate({path:"templatename", model:'TaskTemplate'})
//       .populate({ path: "tasktags", model: "Tags" })
//       .populate({ path: "taskassignees", model: "User" });

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const job = task.job;
//     if (!job) {
//       return res.status(404).json({ message: "Job not found for the task" });
//     }


//     // // Fetch account and associated contacts
//     // const account = await Accounts.findById(job.accounts).populate("contacts");

//     // const validContact = account.contacts.filter((contact) => contact.login);

//     // // Define placeholder values
//     // const placeholderValues = {
//     //   ACCOUNT_NAME: account?.accountName || "",
//     //   FIRST_NAME: validContact[0]?.firstName || "",
//     //   MIDDLE_NAME: validContact[0]?.middleName || "",
//     //   LAST_NAME: validContact[0]?.lastName || "",
//     //   CONTACT_NAME: validContact[0]?.contactName || "",
//     //   COMPANY_NAME: validContact[0]?.companyName || "",
//     //   COUNTRY: validContact[0]?.country || "",
//     //   STREET_ADDRESS: validContact[0]?.streetAddress || "",
//     //   STATEPROVINCE: validContact[0]?.state || "",
//     //   PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
//     //   ZIPPOSTALCODE: validContact[0]?.postalCode || "",
//     //   CITY: validContact[0]?.city || "",
//     //   CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
//     //   CURRENT_DAY_NUMBER: currentDate.getDate(),
//     //   CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
//     //     weekday: "long",
//     //   }),
//     //   CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
//     //   CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
//     //     month: "long",
//     //   }),
//     //   CURRENT_YEAR: currentDate.getFullYear(),
//     //   LAST_DAY_FULL_DATE: lastDayFullDate,
//     //   LAST_DAY_NUMBER: lastDayNumber,
//     //   LAST_DAY_NAME: lastDayName,
//     //   LAST_WEEK: lastWeek,
//     //   LAST_MONTH_NUMBER: lastMonthNumber,
//     //   LAST_MONTH_NAME: lastMonthName,
//     //   LAST_QUARTER: lastQuarter,
//     //   LAST_YEAR: lastYear,
//     //   NEXT_DAY_FULL_DATE: nextDayFullDate,
//     //   NEXT_DAY_NUMBER: nextDayNumber,
//     //   NEXT_DAY_NAME: nextDayName,
//     //   NEXT_WEEK: nextWeek,
//     //   NEXT_MONTH_NUMBER: nextMonthNumber,
//     //   NEXT_MONTH_NAME: nextMonthName,
//     //   NEXT_QUARTER: nextQuarter,
//     //   NEXT_YEAR: nextYear,
//     //   // Add other dynamic placeholders as required
//     // };

//     if (task.accounts) {
//       const account = await Accounts.findById(task.accounts).populate("contacts");

//       if (account) {
//         accountName = account.accountName || "";
//         // accountId = account._id;
//         const validContact = account.contacts.filter((contact) => contact.login);

//         placeholderValues = {
//           ACCOUNT_NAME: account?.accountName || "",
//           FIRST_NAME: validContact[0]?.firstName || "",
//           MIDDLE_NAME: validContact[0]?.middleName || "",
//           LAST_NAME: validContact[0]?.lastName || "",
//           CONTACT_NAME: validContact[0]?.contactName || "",
//           COMPANY_NAME: validContact[0]?.companyName || "",
//           COUNTRY: validContact[0]?.country || "",
//           STREET_ADDRESS: validContact[0]?.streetAddress || "",
//           STATEPROVINCE: validContact[0]?.state || "",
//           PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
//           ZIPPOSTALCODE: validContact[0]?.postalCode || "",
//           CITY: validContact[0]?.city || "",
//           CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
//           CURRENT_DAY_NUMBER: currentDate.getDate(),
//           CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
//             weekday: "long",
//           }),
//           CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
//           CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
//             month: "long",
//           }),
//           CURRENT_YEAR: currentDate.getFullYear(),
//           LAST_DAY_FULL_DATE: lastDayFullDate,
//           LAST_DAY_NUMBER: lastDayNumber,
//           LAST_DAY_NAME: lastDayName,
//           LAST_WEEK: lastWeek,
//           LAST_MONTH_NUMBER: lastMonthNumber,
//           LAST_MONTH_NAME: lastMonthName,
//           LAST_QUARTER: lastQuarter,
//           LAST_YEAR: lastYear,
//           NEXT_DAY_FULL_DATE: nextDayFullDate,
//           NEXT_DAY_NUMBER: nextDayNumber,
//           NEXT_DAY_NAME: nextDayName,
//           NEXT_WEEK: nextWeek,
//           NEXT_MONTH_NUMBER: nextMonthNumber,
//           NEXT_MONTH_NAME: nextMonthName,
//           NEXT_QUARTER: nextQuarter,
//           NEXT_YEAR: nextYear,
//         };
//       }
//     }
//     // Function to replace placeholders in text
//     const replacePlaceholders = (template, data) => {
//       return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
//         return data[placeholder.trim()] || "";
//       });
//     };

//     // Extract Job details (Separate fields)
//     const jobId = job._id;
//     const jobName = replacePlaceholders(job.jobname || "", placeholderValues);

//     const taskList = {
//         id:task._id,
//         Accounts:task.accounts,
//         Assignees:task.taskassignees,
//         Name:task.taskname,
//         Tags:task.tasktags,
//         Job: {
//           _id:jobId,
//           Name:jobName,
//         },
//         SubtaskCheck:task.issubtaskschecked,
//         SubtaskList:task.subtasks,
//         TaskTemp:{
//           _id:task.templatename._id,
//           Name:task.templatename.templatename
//         },
//         Descriptions:task.description,
//         StartDate:task.startdate,
//         DueDate:task.enddate,
//         Status:task.status,
//         Priority:task.priority,
//         createdAt:task.createdAt,
//         updatedAt:task.updatedAt
//       }

//     res.status(200).json({ message: "Task retrieved successfully", taskList });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const getsTaskListById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id)
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({ path: "job", model: "Job" })
      .populate({ path: "templatename", model: "TaskTemplate" })
      .populate({ path: "tasktags", model: "Tags" })
      .populate({ path: "taskassignees", model: "User" });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    let placeholderValues = {};
    let accountName = "";

    if (task.accounts) {
      const account = await Accounts.findById(task.accounts).populate("contacts");

      if (account) {
        accountName = account.accountName || "";
       
        placeholderValues = {
          ACCOUNT_NAME: account?.accountName || "",
                  CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          CURRENT_DAY_NUMBER: currentDate.getDate(),
          CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
          CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: currentDate.getFullYear(),
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
      }
    }

    // Function to replace placeholders in text
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    // Extract Job details (Allow Job to be null)
    let jobId = null;
    let jobName = "";

    if (task.job) {
      jobId = task.job._id;
      jobName = replacePlaceholders(task.job.jobname || "", placeholderValues);
    }

    const taskList = {
      id: task._id,
      Accounts: task.accounts,
      Assignees: task.taskassignees,
      Name: task.taskname,
      Tags: task.tasktags,
      Job: task.job ? { _id: jobId, Name: jobName } : null,
      SubtaskCheck: task.issubtaskschecked,
      SubtaskList: task.subtasks,
      TaskTemp: task.templatename
        ? {
            _id: task.templatename._id,
            Name: task.templatename.templatename,
          }
        : null,
      Descriptions: task.description,
      StartDate: task.startdate,
      DueDate: task.enddate,
      Status: task.status,
      Priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    res.status(200).json({ message: "Task retrieved successfully", taskList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// gets tasks list
// const getCompleteTaskList = async (req, res) => {
//   try {
   

//     const tasks = await Task.find({ status: "Completed" })
//       .populate({ path: "accounts", model: "Accounts" })
//       .populate({
//         path: "job",
//         model: "Job",
//         populate: {
//           path: "pipeline",
//           model: "pipeline",
//           populate: { path: "stages", model: "Stage" },
//         },
//       })
//       .populate({ path: "tasktags", model: "Tags" })
//       .populate({ path: "taskassignees", model: "User" })
//       .sort({ createdAt: -1 });

//     const taskList = [];

//     for (const task of tasks) {
//       const job = task.job;
//       if (!job) continue;

//       const pipeline = await Pipeline.findById(job.pipeline);
//       if (!pipeline) continue;

//       // Extract Pipeline details (Separate fields)
//       const pipelineId = task.job.pipeline._id;
//       const pipelineName = task.job.pipeline.pipelineName || "";

//       const assigneeNames = task.taskassignees.map((assignee) => assignee.username);

//       // Extract tags data
//       const tagsData = task.tasktags.map((tag) => ({
//         id: tag._id,
//         tagName: tag.tagName,
//         tagColour: tag.tagColour,
//       }));

//       // Extract Stage Names & IDs (Separate fields)
//       let stageIds = [];
//       let stageNames = [];
//       if (task.job.stageid) {
//         if (Array.isArray(task.job.stageid)) {
//           task.job.stageid.forEach((stageId) => {
//             const matchedStage = task.job.pipeline.stages.find((stage) =>
//               stage._id.equals(stageId)
//             );
//             if (matchedStage) {
//               stageIds.push(matchedStage._id);
//               stageNames.push(matchedStage.name);
//             }
//           });
//         } else {
//           const matchedStage = task.job.pipeline.stages.find((stage) =>
//             stage._id.equals(task.job.stageid)
//           );
//           if (matchedStage) {
//             stageIds.push(matchedStage._id);
//             stageNames.push(matchedStage.name);
//           }
//         }
//       }
//       // Get subtasks count
//       const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
//       const checkedSubtasks = task.subtasks
//         ? task.subtasks.filter((subtask) => subtask.checked).length
//         : 0;
//       const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`; // Format checked/total

//       // Fetch account and associated contacts
//       const account = await Accounts.findById(job.accounts).populate(
//         "contacts"
//       );

//       // console.log(account)
//       const validContact = account.contacts.filter((contact) => contact.login);
//       // console.log(validContact)
//       // Define placeholder values
//       const placeholderValues = {
//         ACCOUNT_NAME: account?.accountName || "",
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
//         CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
//         CURRENT_DAY_NUMBER: currentDate.getDate(),
//         CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
//           weekday: "long",
//         }),
//         CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
//         CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
//           month: "long",
//         }),
//         CURRENT_YEAR: currentDate.getFullYear(),
//         LAST_DAY_FULL_DATE: lastDayFullDate,
//         LAST_DAY_NUMBER: lastDayNumber,
//         LAST_DAY_NAME: lastDayName,
//         LAST_WEEK: lastWeek,
//         LAST_MONTH_NUMBER: lastMonthNumber,
//         LAST_MONTH_NAME: lastMonthName,
//         LAST_QUARTER: lastQuarter,
//         LAST_YEAR: lastYear,
//         NEXT_DAY_FULL_DATE: nextDayFullDate,
//         NEXT_DAY_NUMBER: nextDayNumber,
//         NEXT_DAY_NAME: nextDayName,
//         NEXT_WEEK: nextWeek,
//         NEXT_MONTH_NUMBER: nextMonthNumber,
//         NEXT_MONTH_NAME: nextMonthName,
//         NEXT_QUARTER: nextQuarter,
//         NEXT_YEAR: nextYear,
//         // Add other dynamic placeholders as required
//       };

//       // Function to replace placeholders in text
//       const replacePlaceholders = (template, data) => {
//         return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
//           return data[placeholder.trim()] || "";
//         });
//       };

//       // // Extract Job details (Separate fields)
//       const jobId = task.job._id;
//       const jobName = replacePlaceholders(
//         task.job.jobname || "",
//         placeholderValues
//       );
//       // task.job.jobname || ""
//       // job.jobname = replacePlaceholders(job.jobname || '', placeholderValues);

//       taskList.push({
        // id: task._id,
        // Name: task.taskname,
        // JobID: jobId, // Job ID (Separate)
        // JobName: jobName, // Job Name (Separate)
        // PipelineId: pipelineId, // Pipeline ID (Separate)
        // PipelineName: pipelineName, // Pipeline Name (Separate)
        // StageIds: stageIds, // Array of Stage IDs
        // StageNames: stageNames, // Array of Stage Names/ Includes array of Stage IDs and Names
        // Assignees: assigneeNames,
        // TaskTags: tagsData,
        // AccountName: task.accounts.accountName,
        // AccountId: task.accounts._id,
        // StartDate: task.startdate,
        // EndDate: task.enddate,
        // Priority: task.priority,
        // Description: task.description,
        // Status: task.status,
        // SubtaskCount: subtaskCount,
        // createdAt: task.createdAt,
        // updatedAt: task.updatedAt,
//       });
//     }

//     res.status(200).json({ message: "Tasks retrieved successfully", taskList });
//     // console.log("tasks list", taskList);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getCompleteTaskList = async (req, res) => {
  try {
    const tasks = await Task.find({ status: "Completed" })
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "job",
        model: "Job",
        populate: {
          path: "pipeline",
          model: "pipeline",
          populate: { path: "stages", model: "Stage" },
        },
      })
      .populate({ path: "tasktags", model: "Tags" })
      .populate({ path: "taskassignees", model: "User" })
      .sort({ createdAt: -1 });

    const taskList = [];

    for (const task of tasks) {
      const job = task.job || null;
      let pipelineId = null;
      let pipelineName = "";
      let stageIds = [];
      let stageNames = [];

      if (job) {
        const pipeline = job.pipeline || null;
        if (pipeline) {
          pipelineId = pipeline._id;
          pipelineName = pipeline.pipelineName || "";

          if (job.stageid) {
            const jobStageIds = Array.isArray(job.stageid) ? job.stageid : [job.stageid];

            jobStageIds.forEach((stageId) => {
              const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
              if (matchedStage) {
                stageIds.push(matchedStage._id);
                stageNames.push(matchedStage.name);
              }
            });
          }
        }
      }

      const assigneeNames = task.taskassignees.map((assignee) => assignee.username);

      const tagsData = task.tasktags.map((tag) => ({
        id: tag._id,
        tagName: tag.tagName,
        tagColour: tag.tagColour,
      }));

      const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
      const checkedSubtasks = task.subtasks
        ? task.subtasks.filter((subtask) => subtask.checked).length
        : 0;
      const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`;

      let accountName = "";
      let accountId = null;
      let placeholderValues = {};

      if (task.accounts) {
        const account = await Accounts.findById(task.accounts).populate("contacts");

        if (account) {
          accountName = account.accountName || "";
          accountId = account._id;
         
          placeholderValues = {
            ACCOUNT_NAME: account?.accountName || "",
                       CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
            CURRENT_DAY_NUMBER: new Date().getDate(),
            CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
            CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
            CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
            CURRENT_YEAR: new Date().getFullYear(),
          };
        }
      }

      const replacePlaceholders = (template, data) => {
        return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
          return data[placeholder.trim()] || "";
        });
      };

      const jobId = job ? job._id : null;
      const jobName = replacePlaceholders(job?.jobname || "", placeholderValues);

      taskList.push({
        id: task._id,
        Name: task.taskname,
        JobID: jobId, // Job ID (Separate)
        JobName: jobName, // Job Name (Separate)
        PipelineId: pipelineId, // Pipeline ID (Separate)
        PipelineName: pipelineName, // Pipeline Name (Separate)
        StageIds: stageIds, // Array of Stage IDs
        StageNames: stageNames, // Array of Stage Names/ Includes array of Stage IDs and Names
        Assignees: assigneeNames,
        TaskTags: tagsData,
        AccountName: task.accounts.accountName,
        AccountId: task.accounts._id,
        StartDate: task.startdate,
        EndDate: task.enddate,
        Priority: task.priority,
        Description: task.description,
        Status: task.status,
        SubtaskCount: subtaskCount,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }

    res.status(200).json({ message: "Completed tasks retrieved successfully", taskList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//const getTaskListByAccountId = async (req, res) => {
//  try {
  //  const { accountId, status } = req.params;
   // const query = { accounts: accountId };
   // if (status !== "all") {
   //   query.status = { $ne: "Completed" };
   // }

  //  const tasks = await Task.find(query)
    //  .populate({ path: "accounts", model: "Accounts" })
    //  .populate({
    //    path: "job",
      //  model: "Job",
      //  populate: {
        //  path: "pipeline",
        //  model: "pipeline",
        //  populate: { path: "stages", model: "Stage" },
       // },
    //  })
    //  .populate({ path: "tasktags", model: "Tags" })
     // .populate({ path: "taskassignees", model: "User" })
    //  .sort({ createdAt: -1 });

   // const taskList = [];

  //  for (const task of tasks) {
    //  const job = task.job || null; // Handle missing job
    //  let pipelineId = null;
    //  let pipelineName = "";
    //  let stageIds = [];
     // let stageNames = [];

   //   if (job) {
      //  const pipeline = job.pipeline || null;

      //  if (pipeline) {
       //   pipelineId = pipeline._id;
        //  pipelineName = pipeline.pipelineName || "";

        //  if (job.stageid) {
          //  const jobStageIds = Array.isArray(job.stageid) ? job.stageid : [job.stageid];
//
          //  jobStageIds.forEach((stageId) => {
             // const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
            //  if (matchedStage) {
             //   stageIds.push(matchedStage._id);
              //  stageNames.push(matchedStage.name);
            //  }
          //  });
        //  }
      //  }
   //   }

    //  const assigneeNames = task.taskassignees.map((assignee) => assignee.username);

    //  // Extract tags data
     // const tagsData = task.tasktags.map((tag) => ({
     //   id: tag._id,
       // tagName: tag.tagName,
     //   tagColour: tag.tagColour,
    //  }));

    //  // Get subtasks count
     // const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
     // const checkedSubtasks = task.subtasks
      //  ? task.subtasks.filter((subtask) => subtask.checked).length
      //  : 0;
    //  const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`;

    //  // Fetch account and associated contacts
    //  let accountName = "";
    //  let accountId = null;
    //  let placeholderValues = {};

     // if (task.accounts) {
      //  const account = await Accounts.findById(task.accounts).populate("contacts");

       // if (account) {
        //  accountName = account.accountName || "";
        //  accountId = account._id;
         // const validContact = account.contacts.filter((contact) => contact.login);

        //  placeholderValues = {
          //  ACCOUNT_NAME: account?.accountName || "",
          //  FIRST_NAME: validContact[0]?.firstName || "",
          //  MIDDLE_NAME: validContact[0]?.middleName || "",
         //   LAST_NAME: validContact[0]?.lastName || "",
          //  CONTACT_NAME: validContact[0]?.contactName || "",
         //   COMPANY_NAME: validContact[0]?.companyName || "",
          //  COUNTRY: validContact[0]?.country || "",
         //   STREET_ADDRESS: validContact[0]?.streetAddress || "",
         //   STATEPROVINCE: validContact[0]?.state || "",
         //   PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
          //  ZIPPOSTALCODE: validContact[0]?.postalCode || "",
          //  CITY: validContact[0]?.city || "",
           // CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          //  CURRENT_DAY_NUMBER: currentDate.getDate(),
          //  CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
          //    weekday: "long",
          //  }),
           // CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
         //   CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
           //   month: "long",
          //  }),
            //CURRENT_YEAR: currentDate.getFullYear(),
          //  LAST_DAY_FULL_DATE: lastDayFullDate,
         //   LAST_DAY_NUMBER: lastDayNumber,
          //  LAST_DAY_NAME: lastDayName,
          //  LAST_WEEK: lastWeek,
          //  LAST_MONTH_NUMBER: lastMonthNumber,
           // LAST_MONTH_NAME: lastMonthName,
           // LAST_QUARTER: lastQuarter,
           // LAST_YEAR: lastYear,
          //  NEXT_DAY_FULL_DATE: nextDayFullDate,
          //  NEXT_DAY_NUMBER: nextDayNumber,
         //   NEXT_DAY_NAME: nextDayName,
          //  NEXT_WEEK: nextWeek,
         //   NEXT_MONTH_NUMBER: nextMonthNumber,
          //  NEXT_MONTH_NAME: nextMonthName,
         //   NEXT_QUARTER: nextQuarter,
          //  NEXT_YEAR: nextYear,
         // };
       // }
     // }

     // // Function to replace placeholders in text
     // const replacePlaceholders = (template, data) => {
      //  return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
      //    return data[placeholder.trim()] || "";
      //  });
   //   };

  //    const jobId = job ? job._id : null;
  //    const jobName = replacePlaceholders(job?.jobname || "", placeholderValues);

     // taskList.push({
      //  id: task._id,
      //  Name: task.taskname,
      //  JobID: jobId, // Can be null
       // JobName: jobName || "", // Can be empty string
      //  PipelineId: pipelineId, // Can be null
       // PipelineName: pipelineName, // Can be empty string
       // StageIds: stageIds, // Can be empty array
       // StageNames: stageNames, // Can be empty array
       // Assignees: assigneeNames,
       // TaskTags: tagsData,
      //  AccountName: accountName, // Can be empty string
     //   AccountId: accountId, // Can be null
      //  StartDate: task.startdate,
      //  EndDate: task.enddate,
      //  Priority: task.priority,
      //  Description: task.description,
      //  Status: task.status,
       // SubtaskCount: subtaskCount,
       // createdAt: task.createdAt,
       // updatedAt: task.updatedAt,
     // });
  //  }

  //  res.status(200).json({ message: "Tasks retrieved successfully", taskList });
 // } catch (error) {
  //  res.status(500).json({ error: error.message });
  //}
///};

//const getCompleteTaskListByAccount = async (req, res) => {
  //try {
   // const { accountId } = req.params;
   // const tasks = await Task.find({ status: "Completed", accounts: accountId })
   //   .populate({ path: "accounts", model: "Accounts" })
      //.populate({
     //   path: "job",
      //  model: "Job",
      //  populate: {
       //   path: "pipeline",
         // model: "pipeline",
        //  populate: { path: "stages", model: "Stage" },
       // },
      //})
     // .populate({ path: "tasktags", model: "Tags" })
      //.populate({ path: "taskassignees", model: "User" })
     // .sort({ createdAt: -1 });

    //  const taskList = [];

    //  for (const task of tasks) {
     //   const job = task.job || null;
     //   let pipelineId = null;
      //  let pipelineName = "";
      //  let stageIds = [];
      //  let stageNames = [];
  
      //  if (job) {
       //   const pipeline = job.pipeline || null;
       //   if (pipeline) {
        //    pipelineId = pipeline._id;
        //    pipelineName = pipeline.pipelineName || "";
  
         //   if (job.stageid) {
          //    const jobStageIds = Array.isArray(job.stageid) ? job.stageid : [job.stageid];
  
            //  jobStageIds.forEach((stageId) => {
             //   const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
             //   if (matchedStage) {
               //   stageIds.push(matchedStage._id);
              //    stageNames.push(matchedStage.name);
              //  }
             // });
           // }
       //  // }
       // }
  
       // const assigneeNames = task.taskassignees.map((assignee) => assignee.username);
  
       // const tagsData = task.tasktags.map((tag) => ({
       //   id: tag._id,
        //  tagName: tag.tagName,
       //   tagColour: tag.tagColour,
      //  }));
  
     //   const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
       // const checkedSubtasks = task.subtasks
        //  ? task.subtasks.filter((subtask) => subtask.checked).length
        //  : 0;
      //  const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`;
  
      //  let accountName = "";
      //  let accountId = null;
      //  let placeholderValues = {};
  
       // if (task.accounts) {
        //  const account = await Accounts.findById(task.accounts).populate("contacts");
  
       //   if (account) {
          //  accountName = account.accountName || "";
          //  accountId = account._id;
         //   const validContact = account.contacts.filter((contact) => contact.login);
  
         //   placeholderValues = {
          //    ACCOUNT_NAME: account?.accountName || "",
         //     FIRST_NAME: validContact[0]?.firstName || "",
         //     MIDDLE_NAME: validContact[0]?.middleName || "",
           //   LAST_NAME: validContact[0]?.lastName || "",
           //   CONTACT_NAME: validContact[0]?.contactName || "",
           //   COMPANY_NAME: validContact[0]?.companyName || "",
           //   COUNTRY: validContact[0]?.country || "",
           //   STREET_ADDRESS: validContact[0]?.streetAddress || "",
           //   STATEPROVINCE: validContact[0]?.state || "",
          //    PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
          //    ZIPPOSTALCODE: validContact[0]?.postalCode || "",
           //   CITY: validContact[0]?.city || "",
           //   CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
          //    CURRENT_DAY_NUMBER: new Date().getDate(),
           //   CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
          //    CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
          //    CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
          //    CURRENT_YEAR: new Date().getFullYear(),
         //   };
        //  }
     //   }
  
      //  const replacePlaceholders = (template, data) => {
       //   return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
         //   return data[placeholder.trim()] || "";
     //  //   });
      //  };
  
       // const jobId = job ? job._id : null;
      //  const jobName = replacePlaceholders(job?.jobname || "", placeholderValues);
  //
        //taskList.push({
       //   id: task._id,
        //  Name: task.taskname,
        //  JobID: jobId, // Job ID (Separate)
         // JobName: jobName, // Job Name (Separate)
         // PipelineId: pipelineId, // Pipeline ID (Separate)
         // PipelineName: pipelineName, // Pipeline Name (Separate)
         // StageIds: stageIds, // Array of Stage IDs
        //  StageNames: stageNames, // Array of Stage Names/ Includes array of Stage IDs and Names
        //  Assignees: assigneeNames,
       //   TaskTags: tagsData,
       //   AccountName: task.accounts.accountName,
       //   AccountId: task.accounts._id,
       //   StartDate: task.startdate,
        //  EndDate: task.enddate,
       //   Priority: task.priority,
        //  Description: task.description,
        //  Status: task.status,
        //  SubtaskCount: subtaskCount,
       //   createdAt: task.createdAt,
     //   //  updatedAt: task.updatedAt,
       // });
     // }
  

  //  res.status(200).json({ message: "Completed tasks retrieved successfully", taskList });
 /// } catch (error) {
   // res.status(500).json({ error: error.message });
  //}
//};

const getTaskListByAccountId = async (req, res) => {
  try {
    const { accountId, status } = req.params;

     // Convert accountid string into an array
     const accountIdsArray = accountId.split(",");
    const query = { accounts: accountIdsArray };
    if (status !== "all") {
      query.status = { $ne: "Completed" };
    }

    const tasks = await Task.find(query)
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "job",
        model: "Job",
        populate: {
          path: "pipeline",
          model: "pipeline",
          populate: { path: "stages", model: "Stage" },
        },
      })
      .populate({ path: "tasktags", model: "Tags" })
      .populate({ path: "taskassignees", model: "User" })
      .sort({ createdAt: -1 });

    const taskList = [];

    for (const task of tasks) {
      const job = task.job || null; // Handle missing job
      let pipelineId = null;
      let pipelineName = "";
      let stageIds = [];
      let stageNames = [];

      if (job) {
        const pipeline = job.pipeline || null;

        if (pipeline) {
          pipelineId = pipeline._id;
          pipelineName = pipeline.pipelineName || "";

          if (job.stageid) {
            const jobStageIds = Array.isArray(job.stageid) ? job.stageid : [job.stageid];

            jobStageIds.forEach((stageId) => {
              const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
              if (matchedStage) {
                stageIds.push(matchedStage._id);
                stageNames.push(matchedStage.name);
              }
            });
          }
        }
      }

      const assigneeNames = task.taskassignees.map((assignee) => assignee.username);

      // Extract tags data
      const tagsData = task.tasktags.map((tag) => ({
        id: tag._id,
        tagName: tag.tagName,
        tagColour: tag.tagColour,
      }));

      // Get subtasks count
      const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
      const checkedSubtasks = task.subtasks
        ? task.subtasks.filter((subtask) => subtask.checked).length
        : 0;
      const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`;

      // Fetch account and associated contacts
      let accountName = "";
      let accountId = null;
      let placeholderValues = {};

      if (task.accounts) {
        const account = await Accounts.findById(task.accounts).populate("contacts");

        if (account) {
          accountName = account.accountName || "";
          accountId = account._id;
         
          placeholderValues = {
            ACCOUNT_NAME: account?.accountName || "",
                       CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
            CURRENT_DAY_NUMBER: currentDate.getDate(),
            CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
              weekday: "long",
            }),
            CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
            CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
              month: "long",
            }),
            CURRENT_YEAR: currentDate.getFullYear(),
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
        }
      }

      // Function to replace placeholders in text
      const replacePlaceholders = (template, data) => {
        return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
          return data[placeholder.trim()] || "";
        });
      };

      const jobId = job ? job._id : null;
      const jobName = replacePlaceholders(job?.jobname || "", placeholderValues);

      taskList.push({
        id: task._id,
        Name: task.taskname,
        JobID: jobId, // Can be null
        JobName: jobName || "", // Can be empty string
        PipelineId: pipelineId, // Can be null
        PipelineName: pipelineName, // Can be empty string
        StageIds: stageIds, // Can be empty array
        StageNames: stageNames, // Can be empty array
        Assignees: assigneeNames,
        TaskTags: tagsData,
        AccountName: accountName, // Can be empty string
        AccountId: accountId, // Can be null
        StartDate: task.startdate,
        EndDate: task.enddate,
        Priority: task.priority,
        Description: task.description,
        Status: task.status,
        SubtaskCount: subtaskCount,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }

    res.status(200).json({ message: "Tasks retrieved successfully", taskList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompleteTaskListByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

     // Convert accountid string into an array
     const accountIdsArray = accountId.split(",");
    // const query = { accounts: accountIdsArray };
    const tasks = await Task.find({ status: "Completed", accounts: accountIdsArray })
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "job",
        model: "Job",
        populate: {
          path: "pipeline",
          model: "pipeline",
          populate: { path: "stages", model: "Stage" },
        },
      })
      .populate({ path: "tasktags", model: "Tags" })
      .populate({ path: "taskassignees", model: "User" })
      .sort({ createdAt: -1 });

      const taskList = [];

      for (const task of tasks) {
        const job = task.job || null;
        let pipelineId = null;
        let pipelineName = "";
        let stageIds = [];
        let stageNames = [];
  
        if (job) {
          const pipeline = job.pipeline || null;
          if (pipeline) {
            pipelineId = pipeline._id;
            pipelineName = pipeline.pipelineName || "";
  
            if (job.stageid) {
              const jobStageIds = Array.isArray(job.stageid) ? job.stageid : [job.stageid];
  
              jobStageIds.forEach((stageId) => {
                const matchedStage = pipeline.stages.find((stage) => stage._id.equals(stageId));
                if (matchedStage) {
                  stageIds.push(matchedStage._id);
                  stageNames.push(matchedStage.name);
                }
              });
            }
          }
        }
  
        const assigneeNames = task.taskassignees.map((assignee) => assignee.username);
  
        const tagsData = task.tasktags.map((tag) => ({
          id: tag._id,
          tagName: tag.tagName,
          tagColour: tag.tagColour,
        }));
  
        const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
        const checkedSubtasks = task.subtasks
          ? task.subtasks.filter((subtask) => subtask.checked).length
          : 0;
        const subtaskCount = `${checkedSubtasks}/${totalSubtasks}`;
  
        let accountName = "";
        let accountId = null;
        let placeholderValues = {};
  
        if (task.accounts) {
          const account = await Accounts.findById(task.accounts).populate("contacts");
  
          if (account) {
            accountName = account.accountName || "";
            accountId = account._id;
            
            placeholderValues = {
              ACCOUNT_NAME: account?.accountName || "",
                           CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
              CURRENT_DAY_NUMBER: new Date().getDate(),
              CURRENT_DAY_NAME: new Date().toLocaleString("default", { weekday: "long" }),
              CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
              CURRENT_MONTH_NAME: new Date().toLocaleString("default", { month: "long" }),
              CURRENT_YEAR: new Date().getFullYear(),
            };
          }
        }
  
        const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || "";
          });
        };
  
        const jobId = job ? job._id : null;
        const jobName = replacePlaceholders(job?.jobname || "", placeholderValues);
  
        taskList.push({
          id: task._id,
          Name: task.taskname,
          JobID: jobId, // Job ID (Separate)
          JobName: jobName, // Job Name (Separate)
          PipelineId: pipelineId, // Pipeline ID (Separate)
          PipelineName: pipelineName, // Pipeline Name (Separate)
          StageIds: stageIds, // Array of Stage IDs
          StageNames: stageNames, // Array of Stage Names/ Includes array of Stage IDs and Names
          Assignees: assigneeNames,
          TaskTags: tagsData,
          AccountName: task.accounts.accountName,
          AccountId: task.accounts._id,
          StartDate: task.startdate,
          EndDate: task.enddate,
          Priority: task.priority,
          Description: task.description,
          Status: task.status,
          SubtaskCount: subtaskCount,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        });
      }
  

    res.status(200).json({ message: "Completed tasks retrieved successfully", taskList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkUpdateTaskStatus = async (req, res) => {
    try {
        const { taskIds, status } = req.body;

        if (!Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "taskIds must be a non-empty array." });
        }

        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }

        const result = await Task.updateMany(
            { _id: { $in: taskIds } },
            { $set: { status } }
        );

        res.status(200).json({
            message: "Task statuses updated successfully.",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Error in bulkUpdateTaskStatus:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};
module.exports = {
  getAllTasks,
  createTask,
  getTaskList,
  getsTaskListById,
  deleteTask,
  updateTasks,
  getsTaskById,
  getCompleteTaskList,getTaskListByAccountId,
  getCompleteTaskListByAccount,bulkUpdateTaskStatus 
};

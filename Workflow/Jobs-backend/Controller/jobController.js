const Job = require("../Models/JobModel");
const Pipeline = require("../Models/pipelineTemplateModel");
const mongoose = require("mongoose");
const Accounts = require("../Models/AccountModel");
const Contacts = require("../Models/contactsModel")
const User = require("../Models/userModel");
const Tags = require("../Models/tagsModel");
const ClientFacingjobStatus = require("../Models/clientfacingjobstatusesModel.js");
const Task = require("../Models/accountTasksModel.js")

const currentDate = new Date();
const lastDay = new Date(currentDate);
lastDay.setDate(lastDay.getDate() - 1); // Subtract 1 day to get the last day
const nextDay = new Date(currentDate);
nextDay.setDate(nextDay.getDate() + 1); // Add 1 day to get the next day

// Define options for formatting date
const options = {
    weekday: 'long',          // Full name of the day of the week (e.g., "Monday")
    day: '2-digit',          // Two-digit day of the month (01 through 31)
    month: 'long',           // Full name of the month (e.g., "January")
    year: 'numeric',         // Four-digit year (e.g., 2022)
    week: 'numeric',         // ISO week of the year (1 through 53)
    monthNumber: '2-digit',  // Two-digit month number (01 through 12)
    quarter: 'numeric',      // Quarter of the year (1 through 4)
};

// Format the current date using options
const currentFullDate = currentDate.toLocaleDateString('en-US', options);
const currentDayNumber = currentDate.getDate();
const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
const currentWeek = currentDate.toLocaleDateString('en-US', { week: 'numeric' });
const currentMonthNumber = currentDate.getMonth() + 1; // Months are zero-based, so add 1
const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3); // Calculate the quarter
const currentYear = currentDate.getFullYear();

// Format the last day using options
const lastDayFullDate = lastDay.toLocaleDateString('en-US', options);
const lastDayNumber = lastDay.getDate();
const lastDayName = lastDay.toLocaleDateString('en-US', { weekday: 'long' });
const lastWeek = lastDay.toLocaleDateString('en-US', { week: 'numeric' });
const lastMonthNumber = lastDay.getMonth() + 1; // Months are zero-based, so add 1
const lastMonthName = lastDay.toLocaleDateString('en-US', { month: 'long' });
const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3); // Calculate the quarter
const lastYear = lastDay.getFullYear();

// Format the next day using options
const nextDayFullDate = nextDay.toLocaleDateString('en-US', options);
const nextDayNumber = nextDay.getDate();
const nextDayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' });
const nextWeek = nextDay.toLocaleDateString('en-US', { week: 'numeric' });
const nextMonthNumber = nextDay.getMonth() + 1; // Months are zero-based, so add 1
const nextMonthName = nextDay.toLocaleDateString('en-US', { month: 'long' });
const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3); // Calculate the quarter
const nextYear = nextDay.getFullYear();

const replacePlaceholders = (template, data) => {
  return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
    return data[placeholder.trim()] || "";
  });
};
//get all JobTemplate
const getJobs = async (req, res) => {
  try {
    const job = await Job.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "Job retrieved successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Jobs by Account ID
// const getJobsByAccount = async (req, res) => {
//   try {
//     // Extract accountId from the request parameters or query
//     const { accountId } = req.params; // or req.query if passed in query string
    
//     // Find jobs where the accountId exists in the "accounts" array
//     const jobs = await Job.find({ accounts: accountId }).populate({
//       path: "pipeline",
//       model: "pipeline",
      
//     });

//     if (jobs.length === 0) {
//       return res.status(404).json({ message: "No jobs found for this account" });
//     }

//     res.status(200).json({ message: "Jobs retrieved successfully", jobs });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// const getJobsByAccount = async (req, res) => {
//   try {
//     const { accountId } = req.params;
//     const accountIdsArray = accountId.split(",");

//     // Fetch jobs where the accountId exists in the "accounts" array
//     const jobs = await Job.find({ accounts: { $in: accountIdsArray } })
//       .populate({ path: "pipeline", model: "pipeline" })
//       .populate({ path: "accounts", model: "Accounts" });

//     const jobList = [];

//     for (const job of jobs) {
//       const accountsname = job.accounts.map((account) => account.accountName);
//       const accountId = job.accounts.map((account) => account._id);

//       // Fetch account and associated contacts
//       const account = await Accounts.findById(accountId).populate("contacts");
//       const validContacts = account.contacts.filter((contact) => contact.login);

//       if (validContacts.length === 0) {
//         return res.status(400).json({ status: 400, message: "No contacts with login enabled." });
//       }

//       // Select the first valid contact
//       const contact = validContacts[0];

//       // Data for placeholder replacement
//       const placeholderData = {
//         ACCOUNT_NAME: accountsname.join(", "),
//         FIRST_NAME: contact.firstName,
//         MIDDLE_NAME: contact.middleName,
//         LAST_NAME: contact.lastName,
//         CONTACT_NAME: contact.contactName,
//         COMPANY_NAME: contact.companyName,
//         COUNTRY: contact.country,
//         STREET_ADDRESS: contact.streetAddress,
//         STATEPROVINCE: contact.state,
//         PHONE_NUMBER: contact.phoneNumbers,
//         ZIPPOSTALCODE: contact.postalCode,
//         CITY: contact.city,
//       };

//       // Replace placeholders in jobname
//       const jobName = replacePlaceholders(job.jobname, placeholderData);

//       jobList.push({
//         id: job._id,
//         Name: jobName,
//         Pipeline: job.pipeline?.pipelineName || null,
//         Accounts: accountsname,
//       });
//     }

//     res.status(200).json({ message: "Jobs retrieved successfully", jobList });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getJobsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const accountIdsArray = accountId.split(",");

    // Fetch jobs where the accountId exists in the "accounts" array
    const jobs = await Job.find({ accounts: { $in: accountIdsArray } })
      .populate({ path: "pipeline", model: "pipeline" })
      .populate({ path: "accounts", model: "clientAccount" });

    const jobList = [];

    // Date placeholders
    const currentDate = new Date();
    const lastDay = new Date(currentDate);
    lastDay.setDate(lastDay.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const placeholderData = {
      CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString("en-US"),
      CURRENT_DAY_NUMBER: currentDate.getDate(),
      CURRENT_DAY_NAME: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
      CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
      CURRENT_MONTH_NAME: currentDate.toLocaleDateString("en-US", { month: "long" }),
      CURRENT_QUARTER: Math.floor((currentDate.getMonth() + 3) / 3),
      CURRENT_YEAR: currentDate.getFullYear(),

      LAST_DAY_FULL_DATE: lastDay.toLocaleDateString("en-US"),
      LAST_DAY_NUMBER: lastDay.getDate(),
      LAST_DAY_NAME: lastDay.toLocaleDateString("en-US", { weekday: "long" }),
      LAST_MONTH_NUMBER: lastDay.getMonth() + 1,
      LAST_MONTH_NAME: lastDay.toLocaleDateString("en-US", { month: "long" }),
      LAST_QUARTER: Math.floor((lastDay.getMonth() + 3) / 3),
      LAST_YEAR: lastDay.getFullYear(),

      NEXT_DAY_FULL_DATE: nextDay.toLocaleDateString("en-US"),
      NEXT_DAY_NUMBER: nextDay.getDate(),
      NEXT_DAY_NAME: nextDay.toLocaleDateString("en-US", { weekday: "long" }),
      NEXT_MONTH_NUMBER: nextDay.getMonth() + 1,
      NEXT_MONTH_NAME: nextDay.toLocaleDateString("en-US", { month: "long" }),
      NEXT_QUARTER: Math.floor((nextDay.getMonth() + 3) / 3),
      NEXT_YEAR: nextDay.getFullYear(),
    };

    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    for (const job of jobs) {
      const accountsname = job.accounts.map((account) => account.accountName);
      const accountIds = job.accounts.map((account) => account._id);

      // Add account name into placeholder data
      const finalPlaceholders = {
        ...placeholderData,
        ACCOUNT_NAME: accountsname.join(", "),
      };

      const jobName = replacePlaceholders(job.jobname, finalPlaceholders);

      jobList.push({
        id: job._id,
        Name: jobName,
        Pipeline: job.pipeline?.pipelineName || null,
        Accounts: accountsname,
        AccountId: accountIds,
      });
    }

    res.status(200).json({ message: "Jobs retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get job count
const getJobsCount = async (req, res) => {
  try {
    const jobCount = await Job.countDocuments(); // Get count of all jobs
    res.status(200).json({ message: "Job count retrieved successfully", count: jobCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get count of active jobs
const getActiveJobCount = async (req, res) => {
  try {
    const activeJobCount = await Job.countDocuments({ active: true }); // Count active jobs
    res.status(200).json({ message: "Active job count retrieved successfully", count: activeJobCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get count of inactive jobs
const getInactiveJobCount = async (req, res) => {
  try {
    const inactiveJobCount = await Job.countDocuments({ active: false }); // Count inactive jobs
    res.status(200).json({ message: "Inactive job count retrieved successfully", count: inactiveJobCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Get a single JobTemplate
const getJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ error: "No such Job" });
    }

    res.status(200).json({ message: "Job retrieved successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};


//POST a new JobTemplate
const createJob = async (req, res) => {
  const {
    accounts,
    pipeline,
    stageid,
    templatename,
    jobname,
    addShortCode,
    jobassignees,
    priority,
    description,
    absolutedates,
    startsin,
    startsinduration,
    duein,
    dueinduration,
    startdate,
    enddate,
    comments,
    showinclientportal,
    jobnameforclient,
    clientfacingstatus,
    clientfacingDescription,
    active,
  } = req.body;

  try {
    // Find the pipeline associated with the job
    const jobPipeline = await Pipeline.findById(pipeline);
    // Get the ID of the first stage in the pipeline
    const defaultStageId =
      jobPipeline.stages.length > 0 ? jobPipeline.stages[0]._id : null;
    // Use the provided stageid or defaultStageId if not provided
    const selectedStageId = stageid || defaultStageId;


    let createdJobs = [];

    for (const accountid of accounts) {
      const newJob = await Job.create({
        accounts: accountid,
        pipeline,
        stageid: selectedStageId,
        templatename,
        jobname,
        addShortCode,
        jobassignees,
        priority,
        description,
        absolutedates,
        startsin,
        startsinduration,
        duein,
        dueinduration,
        startdate,
        enddate,
        comments,
        showinclientportal,
        jobnameforclient,
        clientfacingstatus,
        clientfacingDescription,
        active,
      });
      createdJobs.push(newJob); 
    }
    return res.status(201).json({ message: "Job created successfully",createdJobs });
 
  } catch (error) {
    console.error("Error creating Job:", error);
    return res.status(500).json({ error: "Error creating Job" });
  }
};

//delete a JobTemplate

// const deleteJob = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "Invalid Job ID" });
//   }

//   try {
//     const deletedJob = await Job.findByIdAndDelete({ _id: id });
//     if (!deletedJob) {
//       return res.status(404).json({ error: "No such Job" });
//     }
//     res.status(200).json({ message: "Job deleted successfully", deletedJob });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

const deleteJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return res.status(404).json({ error: "No such Job" });
    }

    // Remove the job reference from all tasks that were linked to this job
    await Task.updateMany({ job: id }, { $unset: { job: "" } });

    res.status(200).json({ message: "Job deleted successfully, tasks updated", deletedJob });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


//update a new tasktemplate
const updateJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "No such Job" });
    }

    res.status(200).json({ message: "Job Updated successfully", updatedJob });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getJobList = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "pipeline",
        model: "pipeline",
        populate: { path: "stages", model: "stage" },
      })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });

    const jobList = [];

    for (const job of jobs) {
      // Fetching the pipeline document for each job
      const pipeline = await Pipeline.findById(job.pipeline);

      if (!pipeline) {
        // If pipeline is not found, skip this job
        continue;
      }

      const jobAssigneeNames = job.jobassignees.map(
        (assignee) => assignee.username
      );

      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

     
      // Fetch account and associated contacts
      const account = await Accounts.findById(
        accountId
      ).populate("contacts");

            let stageNames = null;

      if (Array.isArray(job.stageid)) {
        // Iterate over each stage ID and find the corresponding stage name
        stageNames = [];
        for (const stageId of job.stageid) {
          const matchedStage = pipeline.stages.find((stage) =>
            stage._id.equals(stageId)
          );
          if (matchedStage) {
            stageNames.push(matchedStage.name);
          }
        }
      } else {
        // If job.stageid is not an array, convert it to an array containing a single element
        const matchedStage = pipeline.stages.find((stage) =>
          stage._id.equals(job.stageid)
        );
        if (matchedStage) {
          stageNames = [matchedStage.name];
        }
      }
      const clientFacingStatus = job.clientfacingstatus
        ? {
            statusId: job.clientfacingstatus._id,
            statusName: job.clientfacingstatus.clientfacingName,
            statusColor: job.clientfacingstatus.clientfacingColour,
            // description: job.clientfacingstatus.description,
            // Include other fields from clientfacingstatus as needed
          }
        : null;

        const emailPromises = validContacts.map(async (contactId) => {
          const contact = await Contacts.findById(contactId);
          const placeholderData = {
            ACCOUNT_NAME: accountsname.join(", "),
                       CURRENT_DAY_FULL_DATE: currentFullDate,
            CURRENT_DAY_NUMBER: currentDayNumber,
            CURRENT_DAY_NAME: currentDayName,
            CURRENT_WEEK: currentWeek,
            CURRENT_MONTH_NUMBER: currentMonthNumber,
            CURRENT_MONTH_NAME: currentMonthName,
            CURRENT_QUARTER: currentQuarter,
            CURRENT_YEAR: currentYear,
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
    
          // Replace placeholders in jobname and description
          const jobName = replacePlaceholders(job.jobname, placeholderData);
          const jobDescription = replacePlaceholders(
            job.description,
            placeholderData
          );
    
          jobList.push({
            id: job._id,
            Name: jobName,
            JobAssignee: jobAssigneeNames,
            Pipeline: pipeline ? pipeline.pipelineName : null,
            Stage: stageNames,
            Account: accountsname,
            AccountId: accountId,
            ClientFacingStatus: clientFacingStatus,
            StartDate: job.startdate,
            DueDate: job.enddate,
            Priority: job.priority,
            Description: jobDescription,
            StartsIn: job.startsin
              ? `${job.startsin} ${job.startsinduration}`
              : null,
            DueIn: jobs.duein ? `${jobs.duein} ${jobs.dueinduration}` : null,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
          });
        })
      // Data for placeholder replacement
      await Promise.all(emailPromises);
    }

    res
      .status(200)
      .json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getActiveJobList = async (req, res) => {
//   try {
//     const { isActive } = req.params;
//     const jobs = await Job.find({ active: isActive })
//       .populate({ path: "accounts", model: "Accounts" })
//       .populate({
//         path: "pipeline",
//         model: "pipeline",
//         populate: { path: "stages", model: "stage" },
//       })
//       .populate({ path: "jobassignees", model: "User" })
//       .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });
//     const jobList = [];

//     for (const job of jobs) {
//       // Fetching the pipeline document for each job
//       const pipeline = await Pipeline.findById(job.pipeline);

//       if (!pipeline) {
//         // If pipeline is not found, skip this job
//         continue;
//       }

//       const jobAssigneeNames = job.jobassignees.map(
//         (assignee) => assignee.username
//       );

//       const accountsname = job.accounts.map((account) => account.accountName);
//       const accountId = job.accounts.map((account) => account._id);

//       // Fetch account and associated contacts
//       const account = await Accounts.findById(
//         accountId
//       ).populate("contacts");

//       const validContacts = account.contacts.filter((contact) => contact.login);
//       if (validContacts.length === 0) {
//         return res
//           .status(400)
//           .json({
//             status: 400,
//             message: "No contacts with login enabled.",
//           });
//       }
//       let stageNames = null;

//       if (Array.isArray(job.stageid)) {
//         // Iterate over each stage ID and find the corresponding stage name
//         stageNames = [];
//         for (const stageId of job.stageid) {
//           const matchedStage = pipeline.stages.find((stage) =>
//             stage._id.equals(stageId)
//           );
//           if (matchedStage) {
//             stageNames.push(matchedStage.name);
//           }
//         }
//       } else {
//         // If job.stageid is not an array, convert it to an array containing a single element
//         const matchedStage = pipeline.stages.find((stage) =>
//           stage._id.equals(job.stageid)
//         );
//         if (matchedStage) {
//           stageNames = [matchedStage.name];
//         }
//       }
//       const clientFacingStatus = job.clientfacingstatus
//         ? {
//             statusId: job.clientfacingstatus._id,
//             statusName: job.clientfacingstatus.clientfacingName,
//             statusColor: job.clientfacingstatus.clientfacingColour,
//             // description: job.clientfacingstatus.description,
//             // Include other fields from clientfacingstatus as needed
//           }
//         : null;
//         const emailPromises = validContacts.map(async (contactId) => {
//           const contact = await Contacts.findById(contactId);
//           const placeholderData = {
//             ACCOUNT_NAME: accountsname.join(", "),
//             FIRST_NAME: contact.firstName,
//             MIDDLE_NAME: contact.middleName,
//             LAST_NAME: contact.lastName,
//             CONTACT_NAME: contact.contactName,
//             COMPANY_NAME: contact.companyName,
//             COUNTRY: contact.country,
//             STREET_ADDRESS: contact.streetAddress,
//             STATEPROVINCE: contact.state,
//             PHONE_NUMBER: contact.phoneNumbers,
//             ZIPPOSTALCODE: contact.postalCode,
//             CITY: contact.city,
//             CURRENT_DAY_FULL_DATE: currentFullDate,
//             CURRENT_DAY_NUMBER: currentDayNumber,
//             CURRENT_DAY_NAME: currentDayName,
//             CURRENT_WEEK: currentWeek,
//             CURRENT_MONTH_NUMBER: currentMonthNumber,
//             CURRENT_MONTH_NAME: currentMonthName,
//             CURRENT_QUARTER: currentQuarter,
//             CURRENT_YEAR: currentYear,
//             LAST_DAY_FULL_DATE: lastDayFullDate,
//             LAST_DAY_NUMBER: lastDayNumber,
//             LAST_DAY_NAME: lastDayName,
//             LAST_WEEK: lastWeek,
//             LAST_MONTH_NUMBER: lastMonthNumber,
//             LAST_MONTH_NAME: lastMonthName,
//             LAST_QUARTER: lastQuarter,
//             LAST_YEAR: lastYear,
//             NEXT_DAY_FULL_DATE: nextDayFullDate,
//             NEXT_DAY_NUMBER: nextDayNumber,
//             NEXT_DAY_NAME: nextDayName,
//             NEXT_WEEK: nextWeek,
//             NEXT_MONTH_NUMBER: nextMonthNumber,
//             NEXT_MONTH_NAME: nextMonthName,
//             NEXT_QUARTER: nextQuarter,
//             NEXT_YEAR: nextYear,
//           };
    
//           // Replace placeholders in jobname and description
//           const jobName = replacePlaceholders(job.jobname, placeholderData);
//           const jobDescription = replacePlaceholders(
//             job.description,
//             placeholderData
//           );
    
//           jobList.push({
//             id: job._id,
//             Name: jobName,
//             JobAssignee: jobAssigneeNames,
//             Pipeline: pipeline ? pipeline.pipelineName : null,
//             Stage: stageNames,
//             Account: accountsname,
//             AccountId: accountId,
//             ClientFacingStatus: clientFacingStatus,
//             StartDate: job.startdate,
//             DueDate: job.enddate,
//             Priority: job.priority,
//             Description: jobDescription,
//             StartsIn: job.startsin
//               ? `${job.startsin} ${job.startsinduration}`
//               : null,
//             DueIn: jobs.duein ? `${jobs.duein} ${jobs.dueinduration}` : null,
//             createdAt: job.createdAt,
//             updatedAt: job.updatedAt,
//           });
//         })
//       // Data for placeholder replacement
//       await Promise.all(emailPromises);
//     }
   
//     res
//       .status(200)
//       .json({ message: "JobTemplate retrieved successfully", jobList });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




// const getActiveJobList = async (req, res) => {
//   try {
//     const { isActive } = req.params;
//     const jobs = await Job.find({ active: isActive })
//       .populate({ path: "accounts", model: "Accounts" })
//       .populate({
//         path: "pipeline",
//         model: "pipeline",
//         populate: { path: "stages", model: "stage" },
//       })
//       .populate({ path: "jobassignees", model: "User" })
//       .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" }).sort({ createdAt: -1 });
//     const jobList = [];

//     for (const job of jobs) {
//       const pipeline = await Pipeline.findById(job.pipeline);
//       if (!pipeline) continue;

//       const jobAssigneeNames = job.jobassignees.map(
//         (assignee) => assignee.username
//       );

//       const accountsname = job.accounts.map((account) => account.accountName);
//       const accountId = job.accounts.map((account) => account._id);

//       const account = await Accounts.findById(accountId).populate("contacts");

//       const validContacts = account.contacts.filter((contact) => contact.login);

//       let stageNames = null;
//       if (Array.isArray(job.stageid)) {
//         stageNames = job.stageid
//           .map((stageId) =>
//             pipeline.stages.find((stage) => stage._id.equals(stageId))
//           )
//           .filter(Boolean)
//           .map((stage) => stage.name);
//       } else {
//         const matchedStage = pipeline.stages.find((stage) =>
//           stage._id.equals(job.stageid)
//         );
//         stageNames = matchedStage ? [matchedStage.name] : null;
//       }

//       const clientFacingStatus = job.clientfacingstatus
//         ? {
//             statusId: job.clientfacingstatus._id,
//             statusName: job.clientfacingstatus.clientfacingName,
//             statusColor: job.clientfacingstatus.clientfacingColour,
//           }
//         : null;

//       const commonPlaceholders = {
//         ACCOUNT_NAME: accountsname.join(", "),
//         CURRENT_DAY_FULL_DATE: currentFullDate,
//         CURRENT_DAY_NUMBER: currentDayNumber,
//         CURRENT_DAY_NAME: currentDayName,
//         CURRENT_WEEK: currentWeek,
//         CURRENT_MONTH_NUMBER: currentMonthNumber,
//         CURRENT_MONTH_NAME: currentMonthName,
//         CURRENT_QUARTER: currentQuarter,
//         CURRENT_YEAR: currentYear,
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
//       };

//       if (validContacts.length > 0) {
//         const emailPromises = validContacts.map(async (contactId) => {
//           const contact = await Contacts.findById(contactId);
//           const placeholderData = {
//             ...commonPlaceholders,
//             FIRST_NAME: contact.firstName || "",
//             MIDDLE_NAME: contact.middleName || "",
//             LAST_NAME: contact.lastName || "",
//             CONTACT_NAME: contact.contactName || "",
//             COMPANY_NAME: contact.companyName || "",
//             COUNTRY: contact.country || "",
//             STREET_ADDRESS: contact.streetAddress || "",
//             STATEPROVINCE: contact.state || "",
//             PHONE_NUMBER: contact.phoneNumbers || "",
//             ZIPPOSTALCODE: contact.postalCode || "",
//             CITY: contact.city || "",
//           };

//           const jobName = replacePlaceholders(job.jobname, placeholderData);
//           const jobDescription = replacePlaceholders(
//             job.description,
//             placeholderData
//           );

//           jobList.push({
//             id: job._id,
//             Name: jobName,
//             JobAssignee: jobAssigneeNames,
//             Pipeline: pipeline ? pipeline.pipelineName : null,
//             Stage: stageNames,
//             Account: accountsname,
//             AccountId: accountId,
//             ClientFacingStatus: clientFacingStatus,
//             StartDate: job.startdate,
//             DueDate: job.enddate,
//             Priority: job.priority,
//             Description: jobDescription,
//             StartsIn: job.startsin
//               ? `${job.startsin} ${job.startsinduration}`
//               : null,
//             DueIn: job.duein ? `${job.duein} ${job.dueinduration}` : null,
//             createdAt: job.createdAt,
//             updatedAt: job.updatedAt,
//           });
//         });
//         await Promise.all(emailPromises);
//       } else {
//         // Push job with non-contact placeholders only
//         const placeholderData = {
//           ...commonPlaceholders,
//           FIRST_NAME: "",
//           MIDDLE_NAME: "",
//           LAST_NAME: "",
//           CONTACT_NAME: "",
//           COMPANY_NAME: "",
//           COUNTRY: "",
//           STREET_ADDRESS: "",
//           STATEPROVINCE: "",
//           PHONE_NUMBER: "",
//           ZIPPOSTALCODE: "",
//           CITY: "",
//         };

//         const jobName = replacePlaceholders(job.jobname, placeholderData);
//         const jobDescription = replacePlaceholders(
//           job.description,
//           placeholderData
//         );

//         jobList.push({
//           id: job._id,
//           Name: jobName,
//           JobAssignee: jobAssigneeNames,
//           Pipeline: pipeline ? pipeline.pipelineName : null,
//           Stage: stageNames,
//           Account: accountsname,
//           AccountId: accountId,
//           ClientFacingStatus: clientFacingStatus,
//           StartDate: job.startdate,
//           DueDate: job.enddate,
//           Priority: job.priority,
//           Description: jobDescription,
//           StartsIn: job.startsin
//             ? `${job.startsin} ${job.startsinduration}`
//             : null,
//           DueIn: job.duein ? `${job.duein} ${job.dueinduration}` : null,
//           createdAt: job.createdAt,
//           updatedAt: job.updatedAt,
//         });
//       }
//     }

//     res
//       .status(200)
//       .json({ message: "JobTemplate retrieved successfully", jobList });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getActiveJobList = async (req, res) => {
  try {
    const { isActive } = req.params;
    const jobs = await Job.find({ active: isActive })
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "pipeline",
        model: "pipeline",
        populate: { path: "stages", model: "stage" },
      })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" })
      .sort({ createdAt: -1 });

    const jobList = [];

    // ? Build date placeholders
    const currentDate = new Date();
    const lastDay = new Date(currentDate);
    lastDay.setDate(lastDay.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const commonPlaceholders = {
      CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString("en-US"),
      CURRENT_DAY_NUMBER: currentDate.getDate(),
      CURRENT_DAY_NAME: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
      CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
      CURRENT_MONTH_NAME: currentDate.toLocaleDateString("en-US", { month: "long" }),
      CURRENT_QUARTER: Math.floor((currentDate.getMonth() + 3) / 3),
      CURRENT_YEAR: currentDate.getFullYear(),

      LAST_DAY_FULL_DATE: lastDay.toLocaleDateString("en-US"),
      LAST_DAY_NUMBER: lastDay.getDate(),
      LAST_DAY_NAME: lastDay.toLocaleDateString("en-US", { weekday: "long" }),
      LAST_MONTH_NUMBER: lastDay.getMonth() + 1,
      LAST_MONTH_NAME: lastDay.toLocaleDateString("en-US", { month: "long" }),
      LAST_QUARTER: Math.floor((lastDay.getMonth() + 3) / 3),
      LAST_YEAR: lastDay.getFullYear(),

      NEXT_DAY_FULL_DATE: nextDay.toLocaleDateString("en-US"),
      NEXT_DAY_NUMBER: nextDay.getDate(),
      NEXT_DAY_NAME: nextDay.toLocaleDateString("en-US", { weekday: "long" }),
      NEXT_MONTH_NUMBER: nextDay.getMonth() + 1,
      NEXT_MONTH_NAME: nextDay.toLocaleDateString("en-US", { month: "long" }),
      NEXT_QUARTER: Math.floor((nextDay.getMonth() + 3) / 3),
      NEXT_YEAR: nextDay.getFullYear(),
    };

    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    for (const job of jobs) {
      const pipeline = await Pipeline.findById(job.pipeline);
      if (!pipeline) continue;

      const jobAssigneeNames = job.jobassignees.map(
        (assignee) => assignee.username
      );

      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

      let stageNames = null;
      if (Array.isArray(job.stageid)) {
        stageNames = job.stageid
          .map((stageId) =>
            pipeline.stages.find((stage) => stage._id.equals(stageId))
          )
          .filter(Boolean)
          .map((stage) => stage.name);
      } else {
        const matchedStage = pipeline.stages.find((stage) =>
          stage._id.equals(job.stageid)
        );
        stageNames = matchedStage ? [matchedStage.name] : null;
      }

      const clientFacingStatus = job.clientfacingstatus
        ? {
            statusId: job.clientfacingstatus._id,
            statusName: job.clientfacingstatus.clientfacingName,
            statusColor: job.clientfacingstatus.clientfacingColour,
          }
        : null;

      // ? Only account + dates (no contacts)
      const finalPlaceholders = {
        ...commonPlaceholders,
        ACCOUNT_NAME: accountsname.join(", "),
      };

      const jobName = replacePlaceholders(job.jobname, finalPlaceholders);
      const jobDescription = replacePlaceholders(job.description, finalPlaceholders);

      jobList.push({
        id: job._id,
        Name: jobName,
        JobAssignee: jobAssigneeNames,
        Pipeline: pipeline ? pipeline.pipelineName : null,
        Stage: stageNames,
        Account: accountsname,
        AccountId: accountId,
        visibilityForClient: job.showinclientportal,
        ClientFacingStatus: clientFacingStatus,
        StartDate: job.startdate,
        DueDate: job.enddate,
        Priority: job.priority,
        Description: jobDescription,
        StartsIn: job.startsin ? `${job.startsin} ${job.startsinduration}` : null,
        DueIn: job.duein ? `${job.duein} ${job.dueinduration}` : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });
    }

    res.status(200).json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// jobassignees
const getActiveJobListByUserid = async (req, res) => {
  try {
    const { userid, isActive } = req.params;
    const jobs = await Job.find({ jobassignees: userid, active: isActive })
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "pipeline",
        model: "pipeline",
        populate: { path: "stages", model: "stage" },
      })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" })
      .sort({ createdAt: -1 });

    const jobList = [];

    // ? Build date placeholders once
    const currentDate = new Date();
    const lastDay = new Date(currentDate);
    lastDay.setDate(lastDay.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const commonPlaceholders = {
      CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString("en-US"),
      CURRENT_DAY_NUMBER: currentDate.getDate(),
      CURRENT_DAY_NAME: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
      CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
      CURRENT_MONTH_NAME: currentDate.toLocaleDateString("en-US", { month: "long" }),
      CURRENT_QUARTER: Math.floor((currentDate.getMonth() + 3) / 3),
      CURRENT_YEAR: currentDate.getFullYear(),

      LAST_DAY_FULL_DATE: lastDay.toLocaleDateString("en-US"),
      LAST_DAY_NUMBER: lastDay.getDate(),
      LAST_DAY_NAME: lastDay.toLocaleDateString("en-US", { weekday: "long" }),
      LAST_MONTH_NUMBER: lastDay.getMonth() + 1,
      LAST_MONTH_NAME: lastDay.toLocaleDateString("en-US", { month: "long" }),
      LAST_QUARTER: Math.floor((lastDay.getMonth() + 3) / 3),
      LAST_YEAR: lastDay.getFullYear(),

      NEXT_DAY_FULL_DATE: nextDay.toLocaleDateString("en-US"),
      NEXT_DAY_NUMBER: nextDay.getDate(),
      NEXT_DAY_NAME: nextDay.toLocaleDateString("en-US", { weekday: "long" }),
      NEXT_MONTH_NUMBER: nextDay.getMonth() + 1,
      NEXT_MONTH_NAME: nextDay.toLocaleDateString("en-US", { month: "long" }),
      NEXT_QUARTER: Math.floor((nextDay.getMonth() + 3) / 3),
      NEXT_YEAR: nextDay.getFullYear(),
    };

    // ? helper to replace placeholders
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    for (const job of jobs) {
      const pipeline = await Pipeline.findById(job.pipeline);
      if (!pipeline) continue;

      const jobAssigneeNames = job.jobassignees.map(
        (assignee) => assignee.username
      );

      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

      let stageNames = null;
      if (Array.isArray(job.stageid)) {
        stageNames = job.stageid
          .map((stageId) =>
            pipeline.stages.find((stage) => stage._id.equals(stageId))
          )
          .filter(Boolean)
          .map((stage) => stage.name);
      } else {
        const matchedStage = pipeline.stages.find((stage) =>
          stage._id.equals(job.stageid)
        );
        stageNames = matchedStage ? [matchedStage.name] : null;
      }

      const clientFacingStatus = job.clientfacingstatus
        ? {
            statusId: job.clientfacingstatus._id,
            statusName: job.clientfacingstatus.clientfacingName,
            statusColor: job.clientfacingstatus.clientfacingColour,
          }
        : null;

      // ? Only account + dates (no contacts)
      const finalPlaceholders = {
        ...commonPlaceholders,
        ACCOUNT_NAME: accountsname.join(", "),
      };

      const jobName = replacePlaceholders(job.jobname, finalPlaceholders);
      const jobDescription = replacePlaceholders(job.description, finalPlaceholders);

      jobList.push({
        id: job._id,
        Name: jobName,
        JobAssignee: jobAssigneeNames,
        Pipeline: pipeline ? pipeline.pipelineName : null,
        Stage: stageNames,
        Account: accountsname,
        AccountId: accountId,
        ClientFacingStatus: clientFacingStatus,
        StartDate: job.startdate,
        DueDate: job.enddate,
        Priority: job.priority,
        Description: jobDescription,
        StartsIn: job.startsin ? `${job.startsin} ${job.startsinduration}` : null,
        DueIn: job.duein ? `${job.duein} ${job.dueinduration}` : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });
    }

    res.status(200).json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getActiveJobListbyAccountId = async (req, res) => {
  try {
    const { isActive, accountid } = req.params;

     // Convert accountid string into an array
     const accountIdsArray = accountid.split(",");
console.log("accountIdsArray ",accountIdsArray )
    // Fetch jobs filtered by isActive and accountid
    const jobs = await Job.find({ active: isActive,  accounts: { $in: accountIdsArray }, })
      .populate({ path: "accounts", model: "clientAccount" })
      .populate({
        path: "pipeline",
        model: "pipeline",
      })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });

    const jobList = [];
console.log("jobList",jobs )
    for (const job of jobs) {
      // Extract pipeline and stages
      const pipeline = job.pipeline;
     console.log("JOB PIPELINE",pipeline)
const stageid = job.stageid
 console.log("JOB stageid ",stageid )

 // Get all stage details (not just names)
      const stageDetails = Array.isArray(job.stageid)
        ? job.stageid
            .map((stageId) => {
              const matchedStage = pipeline?.stages?.find((stage) =>
                stage._id.equals(stageId)
              );
              return matchedStage ? matchedStage : null;
            })
            .filter(Boolean)
        : job.stageid
        ? [
            pipeline?.stages?.find((stage) => stage._id.equals(job.stageid)) || null
          ]
        : null;
      // Extract job assignee names and account names
      const jobAssigneeNames = job.jobassignees.map(
        (assignee) => assignee.username
      );
      const accountsname = job.accounts.map((account) => account.accountName);
      const accountId = job.accounts.map((account) => account._id);

      // Fetch account and associated contacts
      const account = await Accounts.findById(accountId).populate("contacts");
      // const validContacts = account.contacts.filter((contact) => contact.login);

      // if (validContacts.length === 0) {
      //   return res
      //     .status(400)
      //     .json({ status: 400, message: "No contacts with login enabled." });
      // }

      // Select the first valid contact (to prevent duplication)
      // const contact = validContacts[0];

      // Extract client-facing status
      const clientFacingStatus = job.clientfacingstatus
        ? {
            statusId: job.clientfacingstatus._id,
            statusName: job.clientfacingstatus.clientfacingName,
            statusColor: job.clientfacingstatus.clientfacingColour,
          }
        : null;

      // Data for placeholder replacement
      const placeholderData = {
        ACCOUNT_NAME: accountsname.join(", "),
        // FIRST_NAME: contact.firstName,
        // MIDDLE_NAME: contact.middleName,
        // LAST_NAME: contact.lastName,
        // CONTACT_NAME: contact.contactName,
        // COMPANY_NAME: contact.companyName,
        // COUNTRY: contact.country,
        // STREET_ADDRESS: contact.streetAddress,
        // STATEPROVINCE: contact.state,
        // PHONE_NUMBER: contact.phoneNumbers,
        // ZIPPOSTALCODE: contact.postalCode,
        // CITY: contact.city,
        CURRENT_DAY_FULL_DATE: currentFullDate,
        CURRENT_DAY_NUMBER: currentDayNumber,
        CURRENT_DAY_NAME: currentDayName,
        CURRENT_WEEK: currentWeek,
        CURRENT_MONTH_NUMBER: currentMonthNumber,
        CURRENT_MONTH_NAME: currentMonthName,
        CURRENT_QUARTER: currentQuarter,
        CURRENT_YEAR: currentYear,
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

      // Replace placeholders in jobname and description
      const jobName = replacePlaceholders(job.jobname, placeholderData);
      const jobDescription = replacePlaceholders(job.description, placeholderData);

      // Push only one job per loop
      jobList.push({
        id: job._id,
        Name: jobName,
        JobAssignee: jobAssigneeNames,
        Pipeline: pipeline?.pipelineName || null,
        PipelineId: pipeline?._id,
        // Stage: stageNames,
        Stages: stageDetails,
        Account: accountsname,
        AccountId: accountId,
        visibilityForClient:job.showinclientportal,
        ClientFacingStatus: clientFacingStatus,
        StartDate: job.startdate,
        DueDate: job.enddate,
        Priority: job.priority,
        Description: jobDescription,
        StartsIn: job.startsin ? `${job.startsin} ${job.startsinduration}` : null,
        DueIn: job.duein ? `${job.duein} ${job.dueinduration}` : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });
    }

    res.status(200).json({ message: "JobTemplate retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getJobListbyid = async (req, res) => {
  const { id } = req.params;
  try {
    const jobs = await Job.findById(id)
      .populate({
        path: "accounts",
        model: "clientAccount",
        populate: {
          path: "tags",
          model: "Tags",
        },
      })
      .populate({
        path: "pipeline",
        model: "pipeline",
        populate: { path: "stages", model: "stage" },
      })
      .populate({ path: "jobassignees", model: "User" })
      .populate({ path: "clientfacingstatus", model: "ClientFacingjobStatus" });
    const pipeline = await Pipeline.findById(jobs.pipeline);

    let stageData  = null;

    if (Array.isArray(jobs.stageid)) {
      stageData  = [];
      for (const stageId of jobs.stageid) {
        const matchedStage = pipeline.stages.find((stage) =>
          stage._id.equals(stageId)
        );
        if (matchedStage) {
          stageData .push({ name: matchedStage.name, _id: matchedStage._id , automations: matchedStage.automations || [],});
        }
      }
    } else {
      const matchedStage = pipeline.stages.find((stage) =>
        stage._id.equals(jobs.stageid)
      );
      if (matchedStage) {
        stageData  = [{ name: matchedStage.name, _id: matchedStage._id, automations: matchedStage.automations || [], }];
      }
    }

    const jobList = {
      id: jobs._id,
      Name: jobs.jobname,
      JobAssignee: jobs.jobassignees,
      Pipeline: {
        _id: pipeline._id,
        Name: pipeline.pipelineName,
      },
      Stage: stageData ,
      Account: jobs.accounts,
      StartDate: jobs.startdate,
      DueDate: jobs.enddate,
      StartsIn: jobs.startsin
        ? `${jobs.startsin} ${jobs.startsinduration}`
        : null,
      DueIn: jobs.duein ? `${jobs.duein} ${jobs.dueinduration}` : null,
      Priority: jobs.priority,
      ClientFacingStatus: jobs.clientfacingstatus,
      ClientFacingDecription: jobs.clientfacingDescription,
      jobClientName: jobs.jobnameforclient,
      ShowinClientPortal: jobs.showinclientportal,
      Description: jobs.description,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
    };

    res.status(200).json({ message: "Job by id retrieved successfully", jobList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updatestgeidtojob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Job ID" });
  }

  try {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "No such Job" });
    }

    res
      .status(200)
      .json({ message: "Stage Id Updated successfully", updatedJob });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getPipelinesFromJobList = async (req, res) => {
  try {
    const { userid, isActive } = req.params;
    const jobs = await Job.find({ jobassignees: userid, active: isActive })
      .populate({ path: "pipeline", model: "pipeline" })
      .sort({ createdAt: -1 });

    const pipeline = jobs.reduce((acc, job) => {
      if (job.pipeline && !acc.some((p) => p.id.equals(job.pipeline._id))) {
        acc.push({
          _id: job.pipeline._id,
          pipelineName: job.pipeline.pipelineName,
        });
      }
      return acc;
    }, []);

    res.status(200).json({ message: "Pipelines retrieved successfully", pipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteJobsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const accountIdsArray = accountId.split(",");

    // Find jobs with any of the provided account IDs in the "accounts" array
    const jobsToDelete = await Job.find({ accounts: { $in: accountIdsArray } });

    if (jobsToDelete.length === 0) {
      return res.status(404).json({ message: "No jobs found for the given account ID(s)." });
    }

    // Delete the matching jobs
    const deleteResult = await Job.deleteMany({ accounts: { $in: accountIdsArray } });

    res.status(200).json({
      message: "Jobs deleted successfully",
      deletedJob: deleteResult,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getActiveJobCount ,
  getInactiveJobCount  ,
  getJobsCount,
  createJob,
  getJobs,
  getJob,
  deleteJob,
  updateJob,
  getJobList,
  getJobListbyid,
  updatestgeidtojob,
  getActiveJobList,
  getActiveJobListbyAccountId,
  getActiveJobListByUserid,
  getPipelinesFromJobList,
  getJobsByAccount,deleteJobsByAccount
};

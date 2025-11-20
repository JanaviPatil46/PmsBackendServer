
const TaskTemplate = require('../models/taskTemplateModel');
const mongoose = require("mongoose");
const User = require('../models/userModel')
const Tags = require('../models/tagsModel')
//get all TaskTemplate
const getTaskTemplates = async (req, res) => {
    try {
        const TaskTemplates = await TaskTemplate.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "TaskTemplates retrieved successfully", TaskTemplates });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

//Get a single TaskTemplate
const getTaskTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Task Template ID" });
    }

    try {
        const taskTemplate = await TaskTemplate.findById(id);

        if (!taskTemplate) {
            return res.status(404).json({ error: "No such TaskTemplate" });
        }

        res.status(200).json({ message: "Task Template retrieved successfully", taskTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//POST a new TaskTemplate 
// const createTaskTemplate = async (req, res) => {
//     const { templatename, status, description, taskassignees, tasktags, priority, absolutedates, startsin, startsinduration, duein, dueinduration, startdate, enddate,issubtaskschecked, subtasks, active } = req.body;

//     try {
        
//         // Check if a task template with similar properties already exists
//         const existingTemplate = await TaskTemplate.findOne({
//             templatename
//         });

//         if (existingTemplate) {
//             return res.status(400).json({ error: "Task Template already exists" });
//         }
//         // If no existing template is found, create a new one
//         const newTaskTemplate = await TaskTemplate.create({ templatename, status, description, taskassignees, tasktags, priority, absolutedates, startsin, startsinduration, duein, dueinduration, startdate, enddate,issubtaskschecked, subtasks, active});
        
//         return res.status(201).json({ message: "Task Template created successfully", newTaskTemplate });
//     } catch (error) {
//         console.error("Error creating Task Template:", error);
//         return res.status(500).json({ error: "Error creating Task Template" });
//     }
// };

const createTaskTemplate = async (req, res) => {
    const { templatename, ...rest } = req.body;

    try {
        const taskTemplate = await TaskTemplate.findOneAndUpdate(
            { templatename },
            { ...rest },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        const wasCreated = taskTemplate.isNew;
        const message = wasCreated ? "Task Template created successfully" : "Task Template updated successfully";

        return res.status(wasCreated ? 201 : 200).json({ message, taskTemplate });

    } catch (error) {
        console.error("Error creating/updating Task Template:", error);
        return res.status(500).json({
            error: "Error creating/updating Task Template",
            details: error.message
        });
    }
};


//delete a TaskTemplate

const deleteTaskTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid TaskTemplate ID" });
    }

    try {
        const deletedTaskTemplate = await TaskTemplate.findByIdAndDelete({ _id: id });
        if (!deletedTaskTemplate) {
            return res.status(404).json({ error: "No such TaskTemplate" });
        }
        res.status(200).json({ message: "TaskTemplate deleted successfully", deletedTaskTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new tasktemplate 
const updateTaskTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid TaskTemplate ID" });
    }

    try {
        const updatedTaskTemplate = await TaskTemplate.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedTaskTemplate) {
            return res.status(404).json({ error: "No such TaskTemplate" });
        }

        res.status(200).json({ message: "TaskTemplate Updated successfully", updatedTaskTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



//Get a single TaskTemplate List
const getTaskTemplateList = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Task Template ID" });
    }

    try {
        const taskTemplate = await TaskTemplate.findById(id)
         .populate({ path: 'taskassignees', model: 'User' })
         .populate({ path: 'tasktags', model: 'Tags' });
                  
        if (!taskTemplate) {
            return res.status(404).json({ error: "No such TaskTemplate" });
        }

        res.status(200).json({ message: "TaskTemplate retrieved successfully", taskTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const checkTemplateNameExists = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ exists: false, message: 'Name is required' });
  }

  try {
    const template = await TaskTemplate.findOne({ templatename: { $regex: `^${name.trim()}$`, $options: 'i' } });

    if (template) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking template name:', error);
    return res.status(500).json({ exists: false, message: 'Server error' });
  }
};

module.exports = {
    createTaskTemplate,
    getTaskTemplate,
    getTaskTemplates,
    deleteTaskTemplate,
    updateTaskTemplate,
    getTaskTemplateList,
    checkTemplateNameExists
}
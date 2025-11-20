const ChatTemplate = require('../models/ChatTempModels');
const mongoose = require("mongoose");

//get all ChatTemplate
const getChatTemplates = async (req, res) => {
    try {
        const chatTemplate = await ChatTemplate.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "ChatTemplate retrieved successfully", chatTemplate });

    } catch (error) {
        res.status(400).json({ error: error })
    }
};

//Get a single ChatTemplate
const getChatTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ChatTemplate ID" });
    }
    try {
        const chatTemplate = await ChatTemplate.findById(id)
        if (!chatTemplate) {
            return res.status(404).json({ error: "No such ChatTemplate" });
        }

        res.status(200).json({ message: "ChatTemplate retrieved successfully", chatTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



//Get a single ChatTemplate List
const getChatTemplateList = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ChatTemplate ID" });
    }

    try {
        const chatTemplate = await ChatTemplate.findById(id)
         .populate({ path: 'from', model: 'User' });
                  
         
        if (!chatTemplate) {
            return res.status(404).json({ error: "No such ChatTemplate" });
        }

        res.status(200).json({ message: "ChatTemplate retrieved successfully", chatTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message});
 }
};



//POST a new ChatTemplate 
// const createChatTemplate = async (req, res) => {
//     const { templatename, from, chatsubject, description, sendreminderstoclient, daysuntilnextreminder, numberofreminders,isclienttaskchecked, clienttasks, active } = req.body;

//     try {
//         // Check if a task template with similar properties already exists
//         const existingTemplate = await ChatTemplate.findOne({
//             templatename
//         });

//         if (existingTemplate) {
//             return res.status(201).json({ message: "ChatTemplate  already exists" });
//         }
//         // If no existing template is found, create a new one
//         const newChatTemplate = await ChatTemplate.create({templatename, from, chatsubject, description, sendreminderstoclient, daysuntilnextreminder, numberofreminders,isclienttaskchecked, clienttasks, active });
//         return res.status(201).json({ message: "ChatTemplate created successfully", newChatTemplate });
//     } catch (error) {
//         console.error("Error creating ChatTemplate:", error);
//         return res.status(500).json({ error: "Error creating ChatTemplate" });
//     }
// };

// POST a new ChatTemplate or update if it already exists
const createChatTemplate = async (req, res) => {
    const { templatename, ...rest } = req.body;

    try {
        const chatTemplate = await ChatTemplate.findOneAndUpdate(
            { templatename },
            { ...rest },
            { 
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        const wasCreated = chatTemplate.isNew;
        const message = wasCreated ? "ChatTemplate updated successfully" : "ChatTemplate created successfully";
        
        return res.status(wasCreated ? 201 : 200).json({ message, chatTemplate });
        
    } catch (error) {
        console.error("Error creating/updating ChatTemplate:", error);
        return res.status(500).json({ 
            error: "Error creating/updating ChatTemplate",
            details: error.message 
        });
    }
};
//delete a ChatTemplate

const deleteChatTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ChatTemplate ID" });
    }

    try {
        const deletedChatTemplate = await ChatTemplate.findByIdAndDelete({ _id: id });
        if (!deletedChatTemplate) {
            return res.status(404).json({ error: "No such ChatTemplate" });
        }
        res.status(200).json({ message: "ChatTemplate deleted successfully", deletedChatTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new ChatTemplate 
const updateChatTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ChatTemplate ID" });
    }

    try {
        const updatedChatTemplate = await ChatTemplate.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedChatTemplate) {
            return res.status(404).json({ error: "No such ChatTemplate" });
        }

        res.status(200).json({ message: "ChatTemplate Updated successfully", updatedChatTemplate});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const checkTemplateNameExists = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ exists: false, message: 'Name is required' });
  }

  try {
    const template = await ChatTemplate.findOne({ templatename: { $regex: `^${name.trim()}$`, $options: 'i' } });

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
    createChatTemplate,
    getChatTemplate,
    getChatTemplates,
    deleteChatTemplate,
    updateChatTemplate  ,
    getChatTemplateList,
    checkTemplateNameExists
}
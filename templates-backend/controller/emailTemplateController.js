const EmailTemplate = require('../models/emailTemplateModel');
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const util = require('util');
const mv = util.promisify(fs.rename);
//get all JobTemplate
const getEmailTemplates = async (req, res) => {
    try {
        const emailTemplate = await EmailTemplate.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "EmailTemplate retrieved successfully", emailTemplate });

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
};

//Get a single JobTemplate
const getEmailTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Emailtemplate ID" });
    }

    try {
        const emailTemplate = await EmailTemplate.findById(id)


        if (!emailTemplate) {
            return res.status(404).json({ error: "No such EmailTemplate" });
        }

        res.status(200).json({ message: "EmailTemplate retrieved successfully", emailTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



//Get a single JobTemplate List
const getEmailTemplateList = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid EmailTemplate ID" });
    }

    try {
        const emailTemplate = await EmailTemplate.findById(id)
            .populate({ path: 'from', model: 'User' });


        if (!emailTemplate) {
            return res.status(404).json({ error: "No such emailTemplate" });
        }

        res.status(200).json({ message: "emailTemplate retrieved successfully", emailTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// const createEmailTemplate = async (req, res) => {
//   const { templatename, from, emailsubject, emailbody, active,mode } = req.body;

//   try {
//     const existingTemplate = await EmailTemplate.findOne({ templatename });
//     if (existingTemplate) {
//       return res.status(200).json({ message: "EmailTemplate already exists" });
//     }

//     // Temporarily gather file info
//     const attachments = req.files.map(file => ({
//       originalPath: file.path,
//       originalname: file.originalname,
//       size: file.size,
//     }));

//     // Create EmailTemplate (without file info)
//     const newEmailTemplate = new EmailTemplate({
//       templatename,
//       from,
//       emailsubject,
//       emailbody,
//       mode,
//       active,
//     });

//     await newEmailTemplate.save();

//     // Create a folder named with the template ID
//     const folderPath = path.join('uploads', newEmailTemplate._id.toString());
//     if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

//     // Move files and update attachment paths
//     const movedAttachments = [];

//     for (const file of attachments) {
//       const newFilePath = path.join(folderPath, file.originalname);
//       await mv(file.originalPath, newFilePath);
//       movedAttachments.push({
//         filename: file.originalname,
//         size: file.size,
//       });
//     }

//     // Update template with attachments
//     newEmailTemplate.attachments = movedAttachments;
//     await newEmailTemplate.save();

//     return res.status(201).json({
//       message: "EmailTemplate created successfully",
//       newEmailTemplate,
//     });

//   } catch (error) {
//     console.error("Error creating EmailTemplate:", error);
//     return res.status(500).json({ error: "Error creating EmailTemplate" });
//   }
// };

//delete a JobTemplate

const createEmailTemplate = async (req, res) => {
  const { templatename, ...rest } = req.body;

  try {
    // Temporarily gather uploaded file info
    const attachments = req.files?.map(file => ({
      originalPath: file.path,
      originalname: file.originalname,
      size: file.size,
    })) || [];

    // Upsert the email template without attachments first
    const emailTemplate = await EmailTemplate.findOneAndUpdate(
      { templatename },
      { ...rest },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const wasCreated = emailTemplate.isNew;
    const folderPath = path.join('uploads', emailTemplate._id.toString());

    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Move uploaded files and prepare attachment data
    const movedAttachments = [];
    for (const file of attachments) {
      const newFilePath = path.join(folderPath, file.originalname);
      await mv(file.originalPath, newFilePath);
      movedAttachments.push({
        filename: file.originalname,
        size: file.size,
      });
    }

    // Update email template with attachments if files were uploaded
    if (movedAttachments.length > 0) {
      emailTemplate.attachments = movedAttachments;
      await emailTemplate.save();
    }

    const message = wasCreated
      ? "EmailTemplate created successfully"
      : "EmailTemplate updated successfully";

    return res.status(wasCreated ? 201 : 200).json({ message, emailTemplate });

  } catch (error) {
    console.error("Error creating/updating EmailTemplate:", error);
    return res.status(500).json({
      error: "Error creating/updating EmailTemplate",
      details: error.message,
    });
  }
};

const deleteEmailTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid EmailTemplate ID" });
    }

    try {
        const deletedEmailTemplate = await EmailTemplate.findByIdAndDelete({ _id: id });
        if (!deletedEmailTemplate) {
            return res.status(404).json({ error: "No such EmailTemplate" });
        }
        res.status(200).json({ message: "EmailTemplate deleted successfully", deletedEmailTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateEmailTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid EmailTemplate ID" });
  }

  try {
    const existingTemplate = await EmailTemplate.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({ error: "No such EmailTemplate" });
    }

    const { templatename, from, emailsubject, emailbody,mode, active } = req.body;

    const updateData = {
      templatename,
      from,
      emailsubject,
      emailbody,
mode,
      active,
    };

    // Prepare file handling if new files were uploaded
    let newAttachments = [];

    if (req.files && req.files.length > 0) {
      const folderPath = path.join('uploads', id);
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

      for (const file of req.files) {
        const newPath = path.join(folderPath, file.originalname);
        await mv(file.path, newPath); // Move file from temp to final location

        newAttachments.push({
          filename: file.originalname,
          size: file.size,
        });
      }

      // Merge new attachments with existing ones
      updateData.attachments = [...existingTemplate.attachments, ...newAttachments];
    } else {
      updateData.attachments = existingTemplate.attachments;
    }

    const updatedEmailTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
console.log(updatedEmailTemplate )
    if (!updatedEmailTemplate) {
      return res.status(404).json({ error: "No such EmailTemplate" });
    }

    res.status(200).json({ message: "EmailTemplate Updated successfully", updatedEmailTemplate });
  } catch (error) {
    console.error("Update failed:", error);
    return res.status(500).json({ error: error.message });
  }
};
const deleteAttachment = async (req, res) => {
  try {
    const { templateId, filename } = req.params;

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Email Template not found' });
    }

    // Find the attachment index
    const attachmentIndex = template.attachments.findIndex(att => att.filename === filename);
    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Optional: Delete file from server
    const filePath = path.join(__dirname, `../uploads/${templateId}`, filename); // adjust path if needed
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove attachment from array
    template.attachments.splice(attachmentIndex, 1);
    await template.save();

    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    console.error('Attachment delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// const updateEmailTemplate = async (req, res) => {
//     const { id } = req.params;
  
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "Invalid EmailTemplate ID" });
//     }
  
//     try {
//       // Fetch the existing email template
//       const existingTemplate = await EmailTemplate.findById(id);
  
//       if (!existingTemplate) {
//         return res.status(404).json({ error: "No such EmailTemplate" });
//       }
  
//       // Extract form data from the request body
//       const { templatename, from, emailsubject, emailbody, active } = req.body;
  
//       // Prepare the update object
//       const updateData = {
//         templatename,
//         from,
//         emailsubject,
//         emailbody,
//         active,
//       };
  
//       // If files are uploaded, combine them with the existing attachments
//       if (req.files && req.files.length > 0) {
//         const newAttachments = req.files.map((file) => ({
//           filename: file.filename, // Saved filename
//           size: file.size, // File size in bytes
//         }));
  
//         // Combine existing attachments with new attachments
//         updateData.attachments = [...existingTemplate.attachments, ...newAttachments];
//       } else {
//         // If no new files are uploaded, retain the existing attachments
//         updateData.attachments = existingTemplate.attachments;
//       }
  
//       // Find and update the email template
//       const updatedEmailTemplate = await EmailTemplate.findOneAndUpdate(
//         { _id: id },
//         updateData,
//         { new: true } // Return the updated document
//       );
  
//       if (!updatedEmailTemplate) {
//         return res.status(404).json({ error: "No such EmailTemplate" });
//       }
  
//       res.status(200).json({ message: "EmailTemplate Updated successfully", updatedEmailTemplate });
//       console.log(updatedEmailTemplate);
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   };


const checkTemplateNameExists = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ exists: false, message: 'Name is required' });
  }

  try {
    const template = await EmailTemplate.findOne({ templatename: { $regex: `^${name.trim()}$`, $options: 'i' } });

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
    createEmailTemplate,
    getEmailTemplates,
    getEmailTemplate,
    deleteEmailTemplate,
    updateEmailTemplate,
    getEmailTemplateList, deleteAttachment,
    checkTemplateNameExists
}
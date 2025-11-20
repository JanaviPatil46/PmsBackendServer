const FolderTemplate = require('../models/folderTempModel'); // Adjust the path to your model
const fs = require("fs");
const path = require("path");

const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads/FolderTemplates");
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
function getMetaPath(folderPath, fileName = null) {
  ensureDir(folderPath);
  return fileName
    ? path.join(folderPath, `${fileName}.meta.json`)
    : path.join(folderPath, "folder.meta.json");
}
function writeMeta(folderPath, data, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  try {
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing metadata:", metaPath, err);
  }
}
const createFolderTemplate = async (req, res) => {
  try {
    const { templatename } = req.body;
    if (!templatename) {
      return res.status(400).json({ error: "templatename is required" });
    }

    // Create MongoDB entry
    const template = new FolderTemplate({ templatename });
    await template.save();

    // Use only _id as folder name
    const template_id = template._id.toString();

    // Create base folder using _id only
    const templateFolder = path.join(BASE_UPLOAD_PATH, template_id);
    if (fs.existsSync(templateFolder)) {
      return res.status(400).json({ error: "Template folder already exists" });
    }
    fs.mkdirSync(templateFolder, { recursive: true });

    // Create subfolders
    const subfolders = ["Client Uploaded Documents", "Firm Documents Shared with Client", "Private"];
    subfolders.forEach(sub => {
      ensureDir(path.join(templateFolder, sub));
    });

    // Write metadata for main folder and subfolders
    const metaData = {
      templatename,
      path: path.relative(BASE_UPLOAD_PATH, templateFolder),
      createdAt: new Date().toISOString(),
      readOnly: false,
      createdBy: "system",
      files: [],
      type: "template",
      template_id,
      subfolders,
    };
    writeMeta(templateFolder, metaData);

    subfolders.forEach(sub => {
      writeMeta(
        path.join(templateFolder, sub),
        {
          name: sub,
          path: path.relative(BASE_UPLOAD_PATH, path.join(templateFolder, sub)),
          createdAt: new Date().toISOString(),
          readOnly: false,
          createdBy: "system",
          parentTemplate: template_id,
          template_id,
        }
      );
    });

    res.status(201).json({
      message: "Folder template created successfully",
      template_id,
      templatePath: path.relative(BASE_UPLOAD_PATH, templateFolder),
      subfolders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// get all folder
const getFolderTemplates = async (req, res) => {
  try {
    const folderTemplates = await FolderTemplate.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Folder Templates retrieved successfully", folderTemplates });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// ? Rename Folder Template
const renameFolderTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || !id) {
      return res.status(400).json({ error: "Template ID and newName are required" });
    }

    const template = await FolderTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Update MongoDB
    template.templatename = newName;
    await template.save();

    // Update meta file
    const templateFolder = path.join(BASE_UPLOAD_PATH, id);
    const metaFile = path.join(templateFolder, "folder.meta.json");
    if (fs.existsSync(metaFile)) {
      const meta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
      meta.templatename = newName;
      writeMeta(templateFolder, meta);
    }

    res.status(200).json({
      message: "Template renamed successfully",
      updatedTemplate: template,
    });
  } catch (err) {
    console.error("Error renaming template:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ? Delete Folder Template
const deleteFolderTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await FolderTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Delete folder from disk
    const templateFolder = path.join(BASE_UPLOAD_PATH, id);
    if (fs.existsSync(templateFolder)) {
      fs.rmSync(templateFolder, { recursive: true, force: true });
    }

    // Remove from MongoDB
    await FolderTemplate.findByIdAndDelete(id);

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("Error deleting template:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// ? Get Folder Template By ID
const getFolderTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Template ID is required" });
    }

    const template = await FolderTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Read Meta file from folder
    const templateFolder = path.join(BASE_UPLOAD_PATH, id);
    const metaFile = path.join(templateFolder, "folder.meta.json");

    let metaData = null;
    if (fs.existsSync(metaFile)) {
      try {
        metaData = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
      } catch (error) {
        console.error("Error reading metadata:", error);
      }
    }

    res.status(200).json({
      message: "Folder Template retrieved successfully",
      template,
      meta: metaData
    });
  } catch (error) {
    console.error("Error fetching folder template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createFolderTemplate,
  getFolderTemplates,
 renameFolderTemplate,
  deleteFolderTemplate,
getFolderTemplateById 
};




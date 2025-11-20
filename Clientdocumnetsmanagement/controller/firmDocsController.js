const File = require("../models/FileModel"); // Adjust path if needed
const path = require("path");
const fs = require("fs");


const getFilesByAccountId = async (req, res) => {
    const { accountId } = req.params;
    const folderName = "Firm Docs Shared With Client";
  
    try {
      const files = await File.find({
        accountId,
        filePath: { $regex: folderName, $options: "i" },
      });
  
      res.status(200).json({
        folderName,
        files,
      });
    } catch (error) {
      console.error("Error fetching files by accountId and folder:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

  
const uploadFileInFirm = async (req, res) => {
    let targetPath = req.body.destinationPath;
    const accountId = req.body.accountId;
  
    if (!targetPath) {
      return res.status(400).send({ message: "Path is required in the request body." });
    }
  
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }
  
    if (!accountId) {
      return res.status(400).send({ message: "accountId is required." });
    }
  
    // Clean path
    targetPath = targetPath.replace(/\/\//g, "/");
  console.log("janavi", targetPath)
    // Default permissions
    const defaultPermissions = {
      canView: true,
      canDownload: true,
      canDelete: false,
      canUpdate: false,
  canEsign:false,
      canApprove:false
    };
  
    // Parse permissions
    let permissions;
    try {
      permissions = req.body.permissions ? JSON.parse(req.body.permissions) : defaultPermissions;
    } catch (err) {
      return res.status(400).send({ message: "Invalid permissions format." });
    }
  
    const newFile = new File({
      filename: req.file.filename,
      filePath: targetPath,
      accountId,
      permissions: {
        canView: permissions.canView,
        canDownload: permissions.canDownload,
        canDelete: permissions.canDelete,
        canUpdate: permissions.canUpdate,
  canApprove: permissions.canApprove,
    canEsign: permissions.canEsign,
      },
    });
  
    try {
      await newFile.save();
      res.status(200).send({
        message: "File uploaded successfully!",
        filePath: `/${targetPath}/${req.file.filename}`,
        permissions: newFile.permissions,
        accountId: newFile.accountId,
      });
    } catch (error) {
      res.status(500).send({ message: "Error saving file to database.", error: error.message });
    }
  };

  const createFolderInFirm = async (req, res) => {
    try {
      const folderName = req.query.foldername;
      const folderPath = req.query.path;
      const accountId = req.body.accountId;
      if (!folderName || !folderPath) {
        return res.status(400).send({ error: "Both folder name and path are required" });
      }
  
      if (folderPath.includes("..")) {
        return res.status(400).send({ error: "Invalid folder path" });
      }
  
      // Normalize and construct final folder path
      const relativeSubPath = folderPath.replace(/^.*AccountId\//, "");
      const basePath = path.join("uploads", "AccountId");
      const finalFolderPath = path.join(basePath, relativeSubPath, folderName);
      const normalizedFolderPath = finalFolderPath.replace(/\\/g, "/");
  
      // Create the folder recursively
      await fs.mkdir(normalizedFolderPath, { recursive: true });
  
      // Create a default placeholder file in the folder
      const defaultFileName = "#$default.txt";
      const fullFilePath = path.join(normalizedFolderPath, defaultFileName);
      await fs.writeFile(fullFilePath, "");
  
      // Clean up for DB storage
      const relativeFilePath = fullFilePath
        .replace(path.join(__dirname, "../"), "")
        .replace(/\\/g, "/");
  
      const defaultPermissions = {
        canView: true,
        canDownload: true,
        canDelete: false,
        canUpdate: false,
 canEsign:false,
      canApprove:false
      };
  
      const permissions = req.body.permissions || defaultPermissions;
  
      const newFile = new File({
        filename: defaultFileName,
        filePath: normalizedFolderPath,
        permissions,
        accountId,
      });
  
      await newFile.save();
  
      return res.status(200).send({
        message: "Folder and default.txt file created successfully!",
        folderPath: relativeFilePath.replace(`/${defaultFileName}`, ""),
        permissions: newFile.permissions,
      });
  
    } catch (error) {
      console.error("Error creating folder:", error);
      return res.status(500).send({ error: "Failed to create folder" });
    }
  };
  const updatePermissions = async (req, res) => {
  const { fileId } = req.params;
  const { permissions } = req.body;

  if (!fileId) {
    return res.status(400).json({ message: "fileId is required in the URL." });
  }

  if (
    !permissions ||
    typeof permissions.canView !== "boolean" ||
    typeof permissions.canDownload !== "boolean" ||
    typeof permissions.canDelete !== "boolean" ||
    typeof permissions.canUpdate !== "boolean" ||
     typeof permissions.canEsign !== "boolean" ||
      typeof permissions.canApprove !== "boolean" 
  ) {
    return res.status(400).json({ message: "Invalid permissions structure." });
  }

  try {
    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { permissions },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ message: "File or folder not found." });
    }

    return res.status(200).json({
      message: "Permissions updated successfully.",
      updatedPermissions: updatedFile.permissions,
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const downloadFile = async (req, res) => {
  const { accountId, filename } = req.params;

  try {
    const basePath = path.join(
      __dirname,
      "../uploads/AccountId",
      accountId,
      "Firm Docs Shared With Client"
    );

    const fullPath = path.join(basePath, filename);

    console.log("Trying to download file at:", fullPath);

    if (!fs.existsSync(fullPath)) {
      console.error("File not found:", fullPath);
      return res.status(404).json({ message: "File not found." });
    }

    return res.download(fullPath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        return res.status(500).json({ message: "Error downloading file." });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
const deleteFile = async (req, res) => {
  const { accountId, filename } = req.params;

  try {
    // Find the file document in the database
    const fileDoc = await File.findOne({ accountId, filename });

    if (!fileDoc) {
      return res.status(404).json({ message: "File record not found in database." });
    }

    const absolutePath = path.join( "../", fileDoc.filePath);

    // Delete file from filesystem
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    } else {
      console.warn("File not found in filesystem:", absolutePath);
    }

    // Delete file document from database
    await File.deleteOne({ _id: fileDoc._id });

    return res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ message: "Server error while deleting file." });
  }
};
module.exports = { getFilesByAccountId,uploadFileInFirm,createFolderInFirm,updatePermissions,downloadFile,deleteFile  };

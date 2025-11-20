const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const File = require("../models/FileModel");

const getsClientUploadedDocsUnsealed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const baseRelativePath = `uploads/AccountId/${id}/Client Uploaded Documents/unsealed`;
    const uploadsPath = path.join(__dirname, `../${baseRelativePath}`);

    // Utility to normalize path to forward slashes
    const toForwardSlash = (p) => p.replace(/\\/g, "/");

    // Recursive function
    const getAllItems = async (dir, relativePath = "") => {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = toForwardSlash(path.join(baseRelativePath, relativePath, entry.name));
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath, path.join(relativePath, entry.name));
          return {
            folder: entry.name,
            path: itemRelativePath,
            contents: subItems
          };
        } else {
          return {
            file: entry.name,
            path: itemRelativePath
          };
        }
      }));
      return items;
    };

    await fsp.access(uploadsPath);

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching client uploaded documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getsClientUploadedDocssealed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const baseRelativePath = `uploads/AccountId/${id}/Client Uploaded Documents/sealed`;
    const uploadsPath = path.join(__dirname, `../${baseRelativePath}`);

    const toForwardSlash = (p) => p.replace(/\\/g, "/");

    const getAllItems = async (dir, relativePath = "") => {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = toForwardSlash(path.join(baseRelativePath, relativePath, entry.name));
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath, path.join(relativePath, entry.name));
          return {
            folder: entry.name,
            path: itemRelativePath,
            contents: subItems
          };
        } else {
          return {
            file: entry.name,
            path: itemRelativePath
          };
        }
      }));
      return items;
    };

    await fsp.access(uploadsPath);

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching client uploaded sealed documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ? Helper functions (reuse from movefile)
const copyDirectory = async (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = await fsp.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
};

const deleteDirectory = async (dir) => {
  if (fs.existsSync(dir)) {
    await fsp.rm(dir, { recursive: true, force: true });
  }
};

// ? Sealed/Unsealed move
const moveBetweenSealedUnsealed = async (req, res) => {
  try {
    const { id, itemPath, direction } = req.body;

    if (!id || !itemPath || !direction) {
      return res.status(400).json({
        error: "Missing required parameters: id, itemPath, or direction",
      });
    }

    if (direction !== "toSealed" && direction !== "toUnsealed") {
      return res.status(400).json({
        error: "Invalid direction. Must be 'toSealed' or 'toUnsealed'",
      });
    }

    const basePath = path.resolve(`uploads/AccountId/${id}/Client Uploaded Documents`);
    const sourceBase = direction === "toSealed" ? "unsealed" : "sealed";
    const targetBase = direction === "toSealed" ? "sealed" : "unsealed";

    const absoluteSource = path.join(basePath, sourceBase, itemPath);
    const absoluteDestinationFolder = path.join(basePath, targetBase);

    if (!fs.existsSync(absoluteSource)) {
      return res.status(404).json({ error: "Source file/folder not found" });
    }

    const stats = await fsp.stat(absoluteSource);

    if (stats.isDirectory()) {
      // ? Move folder
      const folderName = path.basename(absoluteSource);
      const finalDestination = path.join(absoluteDestinationFolder, folderName);

      await copyDirectory(absoluteSource, finalDestination);
      await deleteDirectory(absoluteSource);

      return res.json({
        message: `Folder moved ${direction === "toSealed" ? "to sealed" : "to unsealed"} successfully`,
        oldPath: absoluteSource,
        newPath: finalDestination,
      });
    } else {
      // ? Move file
      const fileName = path.basename(absoluteSource);
      const finalDestination = path.join(absoluteDestinationFolder, fileName);

      if (!fs.existsSync(absoluteDestinationFolder)) {
        fs.mkdirSync(absoluteDestinationFolder, { recursive: true });
      }

      await fsp.copyFile(absoluteSource, finalDestination);
      await fsp.unlink(absoluteSource);

      return res.json({
        message: `File moved ${direction === "toSealed" ? "to sealed" : "to unsealed"} successfully`,
        oldPath: absoluteSource,
        newPath: finalDestination,
      });
    }
  } catch (error) {
    console.error("Error moving item:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

const getsClientUploadedDocs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const uploadsPath = path.join(__dirname, `../uploads/AccountId/${id}/Client Uploaded Documents`);

    // Recursive function to get all files and subfolders
    const getAllItems = async (dir) => {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath);
          return { folder: entry.name, contents: subItems };
        } else {
          return { file: entry.name };
        }
      }));
      return items;
    };

    // Check if directory exists
    await fsp.access(uploadsPath);

    let folderContents = await getAllItems(uploadsPath);

    // ? Get only "unsealed" folder contents
    const unsealed = folderContents.find(item => item.folder === "unsealed");
    const finalContents = unsealed ? unsealed.contents : [];

    // Wrap with only "Client Uploaded Documents"
    const result = {
      folders: [
        {
          folder: "Client Uploaded Documents",
          contents: finalContents
        }
      ]
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching client uploaded documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getsPrivateDocs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const baseRelativePath = `uploads/AccountId/${id}/Private`;
    const uploadsPath = path.join(__dirname, `../${baseRelativePath}`);

    const toForwardSlash = (p) => p.replace(/\\/g, "/");

    const getAllItems = async (dir, relativePath = "") => {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const items = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = toForwardSlash(path.join(baseRelativePath, relativePath, entry.name));
        if (entry.isDirectory()) {
          const subItems = await getAllItems(fullPath, path.join(relativePath, entry.name));
          return {
            folder: entry.name,
            path: itemRelativePath,
            contents: subItems
          };
        } else {
          return {
            file: entry.name,
            path: itemRelativePath
          };
        }
      }));
      return items;
    };

    await fsp.access(uploadsPath);

    const folderData = await getAllItems(uploadsPath);

    res.status(200).json({
      folders: [
        {
          folder: "Private",
          path: toForwardSlash(baseRelativePath),
          contents: folderData
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching private documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getsFirmDocs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing folder ID in request params." });
    }

    const dbFiles = await File.find({
      filePath: { $regex: new RegExp(`AccountId/${id}/Firm Docs Shared With Client`) }
    });

    const contents = [];
    const folderMap = new Map();

    dbFiles.forEach(file => {
      const relativePath = file.filePath.split(`AccountId/${id}/Firm Docs Shared With Client`)[1] || "";
      const cleanPath = relativePath.replace(/^\/+/, ""); // Remove leading slash
      const pathSegments = cleanPath.split("/");

      if (pathSegments.length === 1 && pathSegments[0] === "") {
        // Direct file inside "Firm Docs Shared With Client"
        if (file.filename !== "#$default.txt") {
          contents.push({
            file: file.filename,
            metadata: file
          });
        }
      } else {
        // It's in a subfolder like "100/"
        const folderName = pathSegments[0];
        if (file.filename === "#$default.txt") {
          folderMap.set(folderName, {
            folder: folderName,
            contents: [] // we won't show the file
          });
        }
      }
    });

    const folderList = Array.from(folderMap.values());

    const result = {
      folder: "Firm Docs Shared With Client",
      contents: [...folderList, ...contents] // folders first, then files
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching firm docs:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { path: filePath, id } = req.body;

    if (!filePath || !id) {
      return res
        .status(400)
        .json({ error: "Both file path and ID are required." });
    }

    const absolutePath = path.join(filePath);
    console.log("absolutepath", absolutePath);

    let deleted = false;
    let type = null;

    try {
      const stat = await fsp.stat(absolutePath);

      if (stat.isFile()) {
        await fsp.unlink(absolutePath);
        type = "file";
        console.log("Deleted file:", absolutePath);
      } else if (stat.isDirectory()) {
        await fsp.rm(absolutePath, { recursive: true, force: true });
        type = "folder";
        console.log("Deleted folder:", absolutePath);
      }

      deleted = true;
    } catch (fsError) {
      console.warn(
        "File or folder does not exist or could not be accessed:",
        absolutePath
      );
    }

    return res.status(200).json({
      message: deleted
        ? `${type === "folder" ? "Folder" : "File"} deleted successfully`
        : "Item not found, nothing to delete",
      filePath,
      id,
      type: type || "unknown",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ error: "Failed to delete item" });
  }
};

const renameItem = async (req, res) => {
  try {
    const { currentPath, newName } = req.body;

    if (!currentPath || !newName) {
      return res.status(400).json({ error: "Both current path and new name are required." });
    }

    const directory = path.dirname(currentPath); // Keep the same parent folder
    const newPath = path.join(directory, newName); // New path with new name

    try {
      await fsp.rename(currentPath, newPath);

      return res.status(200).json({
        message: "File or folder renamed successfully",
        newName,
      });
    } catch (fsError) {
      console.error("Rename error:", fsError);
      return res.status(500).json({ error: "Failed to rename file or folder" });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getsFirmDocs,
  getsClientUploadedDocsUnsealed,
  getsClientUploadedDocssealed,
  getsPrivateDocs,
  getsClientUploadedDocs,
  moveBetweenSealedUnsealed,
  deleteItem,
  renameItem
};
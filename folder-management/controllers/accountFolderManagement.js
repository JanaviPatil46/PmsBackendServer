const fs = require("fs");
const path = require("path");
const multer = require("multer");
const fse = require("fs-extra"); // safer recursive copy/delete

// ============================
// ?? Base Upload Path & Helpers
// ============================
const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads/accounts");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function getMetaPath(folderPath, fileName = null) {
  ensureDir(folderPath);
  return fileName
    ? path.join(folderPath, `${fileName}.meta.json`)
    : path.join(folderPath, "folder.meta.json");
}

function readMeta(folderPath, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  if (fs.existsSync(metaPath)) {
    try {
      return JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (err) {
      console.error("Error reading metadata:", metaPath, err);
      return {};
    }
  }
  return {};
}

function writeMeta(folderPath, data, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  try {
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing metadata:", metaPath, err);
  }
}

// ============================
// ?? Multer Storage
// ============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    ensureDir(folderPath);
    if (readMeta(folderPath).readOnly)
      return cb(new Error("Folder is read-only"));
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    const fullPath = path.join(folderPath, file.originalname);
    if (fs.existsSync(fullPath)) return cb(new Error("File already exists"));
    cb(null, file.originalname);
  },
});

// For folder upload (multiple files)
const storageFolder = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    const targetPath = path.join(folderPath, path.dirname(file.originalname)); // preserve subfolders
    ensureDir(targetPath);
    if (readMeta(folderPath).readOnly)
      return cb(new Error("Folder is read-only"));
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname));
  },
});

//const uploadSingle = multer({ storage: storageSingle });
// Initialize multer
const upload = multer({ storage });
const uploadMultiple = multer({ storage: storageFolder });
// ============================
// ?? File Operations
// ============================

// Single file upload
const handleFileUpload = [
  upload.array("files", 20), // ? Accept up to 20 files, or just one if single upload
  (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: "No file(s) uploaded" });

      const folderPath = path.join(
        BASE_UPLOAD_PATH,
        req.query.folderPath || ""
      );
      const folderMeta = readMeta(folderPath);
      folderMeta.files = folderMeta.files || [];

      req.files.forEach((file) => {
        const fileMeta = {
          name: file.originalname,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          folder: req.query.folderPath || "",
          uploadedBy: "system",
          readOnly: false,
          readStatus: false,
          signStatus: "",
          authStatus: "",
        };

        folderMeta.files.push(fileMeta);
        writeMeta(folderPath, fileMeta, file.filename);
      });

      writeMeta(folderPath, folderMeta);
      req.folderMeta = folderMeta;

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
// Folder upload
const handleFolderUpload = [
  uploadMultiple.array("files"),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: "No files uploaded" });

      const folderPath = path.join(
        BASE_UPLOAD_PATH,
        req.query.folderPath || ""
      );
      const folderMeta = readMeta(folderPath);
      folderMeta.files = folderMeta.files || [];

      req.files.forEach((file) => {
        const fileMeta = {
          name: file.originalname,
          //storedName: file.filename,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          folder: req.query.folderPath || "",
          uploadedBy: "system",
          readOnly: false,
          readStatus: false,
          signStatus: "",
          authStatus: "",
        };
        folderMeta.files.push(fileMeta);
        writeMeta(folderPath, fileMeta, file.filename);
      });

      writeMeta(folderPath, folderMeta);

      res.status(201).json({
        message: "Folder uploaded successfully",
        files: req.files,
        folderMeta,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// ============================
// ?? Folder Operations
// ============================
const createFolder = (req, res) => {
  try {
    const {
      name,
      parentPath = "",
      accountId,
      readOnly = false,
      invoiceId = null,
      readStatus = false,
      signStatus = "",
      authStatus = "",
    } = req.body;

    if (!name) return res.status(400).json({ error: "Folder name required" });

    if (!BASE_UPLOAD_PATH)
      return res.status(500).json({ error: "BASE_UPLOAD_PATH missing" });

    let parentFolder;

    // Creating under root (account folder)
    if (!parentPath) {
      if (!accountId)
        return res.status(400).json({ error: "accountId required" });

      parentFolder = path.join(BASE_UPLOAD_PATH, accountId);

      if (!fs.existsSync(parentFolder)) {
        fs.mkdirSync(parentFolder, { recursive: true });
      }
    } else {
      // Creating inside an existing folder
      parentFolder = path.join(BASE_UPLOAD_PATH, parentPath);

      if (!fs.existsSync(parentFolder)) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    const newFolderPath = path.join(parentFolder, name);

    if (fs.existsSync(newFolderPath))
      return res.status(400).json({ error: "Folder already exists" });

    fs.mkdirSync(newFolderPath, { recursive: true });

    const metaData = {
      name,
      path: path.relative(BASE_UPLOAD_PATH, newFolderPath),
      createdAt: new Date().toISOString(),
      readOnly,
      invoiceId,
      createdBy: "system",
      files: [],
      readStatus,
      signStatus,
      authStatus,
    };

    writeMeta(newFolderPath, metaData);

    res.status(201).json({ message: "Folder created", metaData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
const moveItem = async (req, res) => {
  try {
    const { sourcePath, destinationPath } = req.body;
    if (!sourcePath || !destinationPath)
      return res.status(400).json({ error: "Source and destination required" });

    const srcFull = path.join(BASE_UPLOAD_PATH, sourcePath);
    const destFull = path.join(BASE_UPLOAD_PATH, destinationPath);

    if (!fs.existsSync(srcFull))
      return res.status(404).json({ error: "Source not found" });
    if (!fs.existsSync(destFull))
      return res.status(404).json({ error: "Destination folder not found" });

    const itemName = path.basename(srcFull);
    const targetPath = path.join(destFull, itemName);

    if (fs.existsSync(targetPath))
      return res
        .status(400)
        .json({ error: "Item already exists at destination" });

    const isDirectory = fs.lstatSync(srcFull).isDirectory();

    // Try moving or copying+removing if across drives
    try {
      fs.renameSync(srcFull, targetPath);
    } catch (err) {
      if (err.code === "EXDEV" || err.code === "EPERM") {
        await fse.copy(srcFull, targetPath);
        await fse.remove(srcFull);
      } else {
        throw err;
      }
    }

    // ------------------------------
    // Recursive meta updater (for folders)
    // ------------------------------
    const updateMetaRecursive = (dir) => {
      const folderMeta = readMeta(dir);
      folderMeta.updatedAt = new Date().toISOString();
      folderMeta.path = path
        .relative(BASE_UPLOAD_PATH, dir)
        .replace(/\\/g, "/");
      folderMeta.name = path.basename(dir);
      writeMeta(dir, folderMeta);

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.lstatSync(fullPath).isDirectory()) {
          updateMetaRecursive(fullPath);
        } else {
          const fileMeta = readMeta(dir, entry);
          if (Object.keys(fileMeta).length) {
            fileMeta.path = path
              .relative(BASE_UPLOAD_PATH, fullPath)
              .replace(/\\/g, "/");
            fileMeta.updatedAt = new Date().toISOString();
            writeMeta(dir, fileMeta, entry);
          }
        }
      }
    };

    // ------------------------------
    // If folder: update all child metas
    // ------------------------------
    if (isDirectory) {
      updateMetaRecursive(targetPath);
    } else {
      // ------------------------------
      // If single file: move meta file too
      // ------------------------------
      const srcParent = path.dirname(srcFull);
      const destParent = path.dirname(targetPath);
      const fileName = path.basename(srcFull);
      const oldMetaPath = path.join(srcParent, `${fileName}.meta.json`);
      const newMetaPath = path.join(destParent, `${fileName}.meta.json`);

      if (fs.existsSync(oldMetaPath)) {
        try {
          // Move the meta file
          fs.renameSync(oldMetaPath, newMetaPath);
        } catch (err) {
          if (err.code === "EXDEV" || err.code === "EPERM") {
            await fse.copy(oldMetaPath, newMetaPath);
            await fse.remove(oldMetaPath);
          } else {
            throw err;
          }
        }

        // Update meta content
        const fileMeta = JSON.parse(fs.readFileSync(newMetaPath, "utf8"));
        fileMeta.path = path
          .relative(BASE_UPLOAD_PATH, targetPath)
          .replace(/\\/g, "/");
        fileMeta.updatedAt = new Date().toISOString();
        writeMeta(destParent, fileMeta, fileName);
      } else {
        // If no meta file existed — create one
        const stats = fs.statSync(targetPath);
        const newFileMeta = {
          name: fileName,
          path: path.relative(BASE_UPLOAD_PATH, targetPath).replace(/\\/g, "/"),
          size: stats.size,
          createdAt: stats.birthtime,
          updatedAt: new Date().toISOString(),
          readOnly: false,
          readStatus: false,
          signStatus: "",
          authStatus: "",
        };
        writeMeta(destParent, newFileMeta, fileName);
      }
    }

    res.status(200).json({
      message: `${isDirectory ? "Folder" : "File"} moved successfully`,
      newPath: path.relative(BASE_UPLOAD_PATH, targetPath).replace(/\\/g, "/"),
    });
  } catch (err) {
    console.error("Error moving item:", err);
    res.status(500).json({
      error: "Failed to move item",
      details: err.message,
    });
  }
};

module.exports = { moveItem };

const renameItem = async (req, res) => {
  try {
    const { currentPath, newName } = req.body;
    if (!currentPath || !newName)
      return res
        .status(400)
        .json({ error: "Current path and new name are required" });

    const srcFull = path.join(BASE_UPLOAD_PATH, currentPath);
    if (!fs.existsSync(srcFull))
      return res.status(404).json({ error: "Source not found" });

    const parentDir = path.dirname(srcFull);
    const destFull = path.join(parentDir, newName);
    if (fs.existsSync(destFull))
      return res
        .status(400)
        .json({ error: "A file/folder with new name exists" });

    const isDirectory = fs.lstatSync(srcFull).isDirectory();

    // Rename folder/file
    try {
      fs.renameSync(srcFull, destFull);
    } catch (err) {
      if (err.code === "EXDEV" || err.code === "EPERM") {
        await fse.copy(srcFull, destFull);
        await fse.remove(srcFull);
      } else {
        throw err;
      }
    }

    // ------------------------------
    // Recursive meta update function
    // ------------------------------
    const updateMetaRecursive = (dir) => {
      const folderMeta = readMeta(dir);
      Object.assign(folderMeta, { updatedAt: new Date().toISOString() });
      folderMeta.name = path.basename(dir);
      folderMeta.path = path
        .relative(BASE_UPLOAD_PATH, dir)
        .replace(/\\/g, "/");
      writeMeta(dir, folderMeta);

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.lstatSync(fullPath).isDirectory()) {
          updateMetaRecursive(fullPath);
        } else {
          const fileMeta = readMeta(dir, entry);
          if (Object.keys(fileMeta).length) {
            fileMeta.path = path
              .relative(BASE_UPLOAD_PATH, fullPath)
              .replace(/\\/g, "/");
            fileMeta.updatedAt = new Date().toISOString();
            writeMeta(dir, fileMeta, entry);
          }
        }
      }
    };

    if (isDirectory) {
      updateMetaRecursive(destFull);
    } else {
      // ? Single file: robust meta update
      const oldFileName = path.basename(currentPath);
      const newFileName = newName;

      let fileMeta = readMeta(parentDir, oldFileName);

      if (Object.keys(fileMeta).length === 0) {
        // fallback: maybe old meta is missing
        fileMeta = {};
      }

      // Preserve existing status fields and other meta
      fileMeta.name = newFileName;
      fileMeta.path = path
        .relative(BASE_UPLOAD_PATH, destFull)
        .replace(/\\/g, "/");
      fileMeta.updatedAt = new Date().toISOString();

      writeMeta(parentDir, fileMeta, newFileName);

      // Remove old meta file if exists
      const oldMetaPath = path.join(parentDir, `${oldFileName}.meta.json`);
      if (fs.existsSync(oldMetaPath)) fs.unlinkSync(oldMetaPath);
    }

    res.status(200).json({
      message: `${isDirectory ? "Folder" : "File"} renamed successfully`,
      newPath: path.relative(BASE_UPLOAD_PATH, destFull).replace(/\\/g, "/"),
    });
  } catch (err) {
    console.error("Error renaming item:", err);
    res
      .status(500)
      .json({ error: "Failed to rename item", details: err.message });
  }
};

// ============================
// ?? Update File/Folder Status (readStatus, signStatus, authStatus)
// ============================
const updateStatus = (req, res) => {
  try {
    const { targetPath, status } = req.body;

    if (!targetPath || !status)
      return res.status(400).json({ error: "targetPath and status required" });

    const fullPath = path.join(BASE_UPLOAD_PATH, targetPath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ error: "File or folder not found" });

    const isDirectory = fs.lstatSync(fullPath).isDirectory();

    const applyMetaUpdate = (meta) => {
      Object.assign(meta, status);            // <--- add all fields from status
      meta.updatedAt = new Date().toISOString();
      return meta;
    };

    const updateMetaRecursive = (dir) => {
      let folderMeta = readMeta(dir);
      folderMeta = applyMetaUpdate(folderMeta);
      writeMeta(dir, folderMeta);

      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const entryPath = path.join(dir, entry);

        if (fs.lstatSync(entryPath).isDirectory()) {
          updateMetaRecursive(entryPath);
        } else {
          let fileMeta = readMeta(dir, entry);
          if (Object.keys(fileMeta).length) {
            fileMeta = applyMetaUpdate(fileMeta);
            writeMeta(dir, fileMeta, entry);
          }
        }
      }
    };

    if (isDirectory) {
      updateMetaRecursive(fullPath);
    } else {
      const parentDir = path.dirname(fullPath);
      const fileName = path.basename(fullPath);

      let fileMeta = readMeta(parentDir, fileName);
      if (Object.keys(fileMeta).length) {
        fileMeta = applyMetaUpdate(fileMeta);
        writeMeta(parentDir, fileMeta, fileName);
      }
    }

    res.json({
      message: `${isDirectory ? "Folder" : "File"} status updated successfully`,
      status
    });

  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = { updateStatus };

const setReadOnly = (req, res) => {
  try {
    const { folderPath, readOnly } = req.body;
    const fullPath = path.join(BASE_UPLOAD_PATH, folderPath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ error: "Folder not found" });

    const meta = readMeta(fullPath);
    meta.readOnly = readOnly;
    meta.updatedAt = new Date().toISOString();
    writeMeta(fullPath, meta);

    res.json({ message: `Folder ${readOnly ? "locked" : "unlocked"}`, meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ?? Set File Read-Only Status
 *
 */
const setFileReadOnly = (req, res) => {
  try {
    const { filePath, readOnly } = req.body;
    const fullPath = path.join(BASE_UPLOAD_PATH, filePath);
    const folderPath = path.dirname(fullPath);
    const fileName = path.basename(fullPath);

    if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
      return res.status(404).json({ error: "File not found" });
    }

    // ? Use your existing readMeta/writeMeta helpers with fileName argument
    const meta = readMeta(folderPath, fileName);
    meta.readOnly = readOnly;
    meta.updatedAt = new Date().toISOString();

    writeMeta(folderPath, meta, fileName);

    res.json({
      message: `File ${readOnly ? "locked" : "unlocked"}`,
      meta,
    });
  } catch (err) {
    console.error("Error in setFileReadOnly:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ??? Delete File or Folder (Universal)
 * Handles both files and folders + associated .meta.json
 */
const deleteItem = (req, res) => {
  try {
    const { targetPath } = req.body;
    if (!targetPath)
      return res
        .status(400)
        .json({ success: false, message: "targetPath required" });

    const fullPath = path.join(BASE_UPLOAD_PATH, targetPath);

    if (!fs.existsSync(fullPath)) {
      return res
        .status(404)
        .json({ success: false, message: "File or folder not found" });
    }

    const stats = fs.statSync(fullPath);

    // ================
    // 1?? DELETE FILE/FOLDER
    // ================
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });

      // Delete folder metadata file if exists
      const folderMetaPath = path.join(
        path.dirname(fullPath),
        `${path.basename(fullPath)}.meta.json`
      );
      if (fs.existsSync(folderMetaPath)) fs.unlinkSync(folderMetaPath);

      // Remove this folder from parent metadata
      removeFromParentMetadata(fullPath);

      return res.json({
        success: true,
        message: "Folder and metadata deleted successfully",
      });
    } else {
      fs.unlinkSync(fullPath);

      // Delete file metadata file if exists
      const metaFilePath = path.join(
        path.dirname(fullPath),
        `${path.basename(fullPath)}.meta.json`
      );
      if (fs.existsSync(metaFilePath)) fs.unlinkSync(metaFilePath);

      // Remove file from parent metadata
      removeFromParentMetadata(fullPath);

      return res.json({
        success: true,
        message: "File and metadata deleted successfully",
      });
    }
  } catch (err) {
    console.error("? Error in deleteItem:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
// ========================
// ?? Helper: Remove from Parent Metadata
// ========================
function removeFromParentMetadata(fullPath) {
  try {
    const parentDir = path.dirname(fullPath);
    const parentMetaPath = path.join(parentDir, "folder.meta.json");

    if (fs.existsSync(parentMetaPath)) {
      const metaData = JSON.parse(fs.readFileSync(parentMetaPath, "utf8"));
      const baseName = path.basename(fullPath);

      // remove from "files" if it's there
      if (metaData.files && Array.isArray(metaData.files)) {
        const updatedFiles = metaData.files.filter(
          (f) => f.name !== baseName
        );
        metaData.files = updatedFiles;
      }

      // remove from "folders" if you also track subfolders
      if (metaData.folders && Array.isArray(metaData.folders)) {
        const updatedFolders = metaData.folders.filter(
          (f) => f.name !== baseName
        );
        metaData.folders = updatedFolders;
      }

      fs.writeFileSync(
        parentMetaPath,
        JSON.stringify(metaData, null, 2),
        "utf8"
      );

      console.log(`? Removed ${baseName} from parent folder metadata`);
    }
  } catch (err) {
    console.error("?? Error updating parent metadata:", err);
  }
}

// ============================
// ?? List Folder Contents
// ============================
const listFolderContent = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath))
      return res.status(404).json({ error: "Folder not found" });

    const entries = fs.readdirSync(folderPath);
    const items = entries
      .filter((f) => !f.endsWith(".meta.json"))
      .map((name) => {
        const fullPath = path.join(folderPath, name);
        const isDir = fs.statSync(fullPath).isDirectory();
        const meta = readMeta(fullPath);
        return {
          name,
          type: isDir ? "folder" : "file",
          path: path.relative(BASE_UPLOAD_PATH, fullPath),
          ...meta,
        };
      });

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// ?? Metadata Operations
// ============================
const getMeta = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath))
      return res.status(404).json({ error: "Folder not found" });
    const meta = readMeta(folderPath, req.query.fileName);
    res.json({ meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateMeta = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.body.folderPath || "");
    if (!fs.existsSync(folderPath))
      return res.status(404).json({ error: "Folder not found" });

    const meta = readMeta(folderPath, req.body.fileName);
    Object.assign(meta, req.body.data);
    meta.updatedAt = new Date().toISOString();
    writeMeta(folderPath, meta, req.body.fileName);

    res.json({ message: "Metadata updated", meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// ?? Recursive Folder Listing (Clean)
// ============================
const listFoldersAndFiles = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Recursive function
    const readRecursive = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      let folders = 0;
      let files = 0;

      const contents = entries
        .filter(
          (entry) => !entry.name.endsWith(".meta.json") // hide meta files
        )
        .map((entry) => {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path
            .relative(BASE_UPLOAD_PATH, fullPath)
            .replace(/\\/g, "/"); // clean path for Windows

          if (entry.isDirectory()) {
            folders++;
            return {
              name: entry.name,
              type: "folder",
              path: relativePath,
              meta: readMeta(fullPath),
              children: readRecursive(fullPath),
            };
          } else {
            files++;
            return {
              name: entry.name,
              type: "file",
              path: relativePath,
              meta: readMeta(path.dirname(fullPath), entry.name),
            };
          }
        });

      return contents;
    };

    const structure = readRecursive(folderPath);

    res.json({
      folder: req.query.folderPath || "/",
      contents: structure,
    });
  } catch (err) {
    console.error("Error reading folders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const clientListFoldersAndFiles = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // ?? Recursive function to read folders and files
    const readRecursive = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      const contents = entries
        .filter(
          (entry) =>
            !entry.name.endsWith(".meta.json") && entry.name !== "Private" // ?? skip private folder
        )
        .map((entry) => {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path
            .relative(BASE_UPLOAD_PATH, fullPath)
            .replace(/\\/g, "/");

          if (entry.isDirectory()) {
            return {
              name: entry.name,
              type: "folder",
              path: relativePath,
              meta: readMeta(fullPath),
              // ?? stop recursion if current folder is "private"
              children: entry.name === "Private" ? [] : readRecursive(fullPath),
            };
          } else {
            return {
              name: entry.name,
              type: "file",
              path: relativePath,
              meta: readMeta(path.dirname(fullPath), entry.name),
            };
          }
        });

      return contents;
    };

    const structure = readRecursive(folderPath);

    res.json({
message:"data retrive successfully"
,      folder: req.query.folderPath || "/",
      contents: structure,
    });
  } catch (err) {
    console.error("Error reading folders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// ?? Exports
// ============================
module.exports = {
  BASE_UPLOAD_PATH,
  ensureDir,
  getMetaPath,
  readMeta,
  writeMeta,
  handleFileUpload,
  uploadFile: [
    handleFileUpload,
    (req, res) =>
      res.status(201).json({
        message: "File uploaded successfully",
        file: req.file,
        folderMeta: req.folderMeta,
        fileMeta: req.fileMeta,
      }),
  ],
  handleFolderUpload,
  createFolder,
  setReadOnly,
  getMeta,
  updateMeta,
  listFolderContent, // ?? new function added here
  listFoldersAndFiles, // ?? add this line
  deleteItem,
  setFileReadOnly,
  moveItem,
  renameItem,
  updateStatus,clientListFoldersAndFiles
};

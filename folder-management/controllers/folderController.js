const fs = require("fs");
const path = require("path");
const multer = require("multer");

// ============================
// 🧩 Utility Functions
// ============================

// Ensure .meta/ folder exists
function ensureMetaDir() {
  if (!fs.existsSync(META_DIR)) {
    fs.mkdirSync(META_DIR, { recursive: true });
  }
}

// Generate metadata path (folder or file)
function getMetaPath(folderPath, fileName = null) {
  ensureMetaDir();

  const folderName = path.basename(folderPath);
  const key = fileName
    ? `${folderName}-${fileName}.json`
    : `${folderName}.json`;
  return path.join(META_DIR, key);
}

// Read metadata JSON
function readMeta(folderPath, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  if (fs.existsSync(metaPath)) {
    return JSON.parse(fs.readFileSync(metaPath, "utf8"));
  }
  return {};
}

// Write metadata JSON
function writeMeta(folderPath, data, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
}

// ============================
// 📁 Create Folder
// ============================
exports.createFolder = (req, res) => {
  try {
    const { name, parentPath, readOnly = false, invoiceId = null } = req.body;
    if (!name) return res.status(400).json({ error: "Folder name required" });

    const parentFolder = parentPath
      ? path.join(BASE_UPLOAD_PATH, parentPath)
      : BASE_UPLOAD_PATH;

    if (!fs.existsSync(parentFolder)) {
      return res.status(404).json({ error: "Parent folder not found" });
    }

    const newFolderPath = path.join(parentFolder, name);
    if (fs.existsSync(newFolderPath)) {
      return res.status(400).json({ error: "Folder already exists" });
    }

    fs.mkdirSync(newFolderPath, { recursive: true });

    const metaData = {
      name,
      path: newFolderPath,
      createdAt: new Date().toISOString(),
      readOnly,
      invoiceId,
      createdBy: "system",
      files: [],
    };

    writeMeta(newFolderPath, metaData);

    res.status(201).json({
      message: "Folder created successfully",
      metaData,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// 🔒 Set Folder Read-only
// ============================
exports.setReadOnly = (req, res) => {
  try {
    const { folderPath, readOnly } = req.body;
    const fullPath = path.join(BASE_UPLOAD_PATH, folderPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const meta = readMeta(fullPath);
    meta.readOnly = readOnly;
    meta.updatedAt = new Date().toISOString();
    writeMeta(fullPath, meta);

    res.json({
      message: `Folder ${readOnly ? "locked" : "unlocked"} successfully`,
      meta,
    });
  } catch (error) {
    console.error("Error setting read-only:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// 🧾 Update Folder Metadata
// ============================
exports.updateMeta = (req, res) => {
  try {
    const { folderPath, data } = req.body;
    const fullPath = path.join(BASE_UPLOAD_PATH, folderPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const meta = readMeta(fullPath);
    Object.assign(meta, data);
    meta.updatedAt = new Date().toISOString();
    writeMeta(fullPath, meta);

    res.json({ message: "Metadata updated successfully", meta });
  } catch (error) {
    console.error("Error updating metadata:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// 📤 File Upload (Original Name, No Overwrite)
// ============================

// const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads");
const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads/FolderTemplates");
const META_DIR = path.join(BASE_UPLOAD_PATH, ".meta");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use query param instead of req.body
    const folderPath = req.query.folderPath || "";
    console.log("Target folder from query:", folderPath);

    const targetFolder = path.join(BASE_UPLOAD_PATH, folderPath);

    // Check if folder exists
    if (!fs.existsSync(targetFolder)) {
      return cb(new Error("Target folder not found"));
    }

    // Read metadata (read-only check)
    const meta = readMeta(targetFolder);
    if (meta.readOnly) {
      return cb(new Error("Folder is read-only. Upload not allowed."));
    }

    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    const folderPath = req.query.folderPath || "";
    const targetFolder = path.join(BASE_UPLOAD_PATH, folderPath);
    const fullFilePath = path.join(targetFolder, file.originalname);

    // Check if file already exists
    if (fs.existsSync(fullFilePath)) {
      return cb(new Error("File with the same name already exists"));
    }

    cb(null, file.originalname); // Keep original name
  },
});

const upload = multer({ storage });

exports.uploadFile = [
  upload.single("file"),
  (req, res) => {
    try {
      // Use query param instead of req.body
      const folderPath = req.query.folderPath || "";
      const targetFolder = path.join(BASE_UPLOAD_PATH, folderPath);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Read folder metadata
      const folderMeta = readMeta(targetFolder);
      if (!folderMeta.files) folderMeta.files = [];

      // File info to store in folder metadata
      const fileInfo = {
        name: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };

      folderMeta.files.push(fileInfo);
      writeMeta(targetFolder, folderMeta);

      // Create individual file metadata
      const fileMeta = {
        ...fileInfo,
        folder: folderPath,
        uploadedBy: "system",
        readOnly: false,
      };
      writeMeta(targetFolder, fileMeta, req.file.filename);

      res.status(201).json({
        message: "File uploaded successfully",
        file: req.file,
        folderMeta,
        fileMeta,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

const express = require("express");
const router = express.Router();
const {
  createFolder,
  setReadOnly,
  uploadFile,
  handleFolderUpload,
  updateMeta,
  listFolderContent,
  listFoldersAndFiles,
  deleteItem,
  deleteFolder,
  setFileReadOnly,
  moveItem,renameItem,updateStatus,clientListFoldersAndFiles
} = require("../controllers/accountFolderManagement");

// ============================
// 📁 & 📄 Document Management Routes
// Base: /api/docManagement
// ============================

// ----- Folder Operations -----
// Create new folder
// POST /api/docManagement/folder
router.post("/folder", createFolder);

// Lock or unlock folder (read-only)
// POST /api/docManagement/folder/readonly
router.post("/folder/readonly", setReadOnly);

// Upload entire folder (multiple files + subfolders)
// POST /api/docManagement/folder/upload?folderPath=subfolder
router.post("/folder/upload", handleFolderUpload);

// POST /api/docManagement/delete
router.post("/delete", deleteItem);

// ----- File Operations -----
// Upload single file to a specific folder
// POST /api/docManagement/file/upload?folderPath=subfolder
router.post("/file/upload", uploadFile);

// Lock or unlock a file (read-only)
// POST /api/files/readonly
router.post("/file/readonly", setFileReadOnly);

// ----- Metadata Operations -----
// Update metadata for file or folder (like invoiceId, tags, description, readOnly)
// POST /api/docManagement/meta
router.post("/meta", updateMeta);

// List folders/files
router.get("/list", listFolderContent);
router.get("/files/list", listFoldersAndFiles);

router.get("/files/list/clientView", clientListFoldersAndFiles);
router.post("/move", moveItem);
router.post("/rename", renameItem)
router.post("/updateStatus", updateStatus);
module.exports = router;

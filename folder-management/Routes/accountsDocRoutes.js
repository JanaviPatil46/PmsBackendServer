const express = require("express");
const router = express.Router();
const multer = require("multer");
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
  uploadFolderRaw,
  moveItem,
  renameItem,
  updateStatus,
  clientListFoldersAndFiles,
  lockUnlockInvoice,
  toggleApprovalStatus,
  uploadFolder,
  uploadFolderZipFplder,
  mergeUnzippedFolderToTarget,
} = require("../controllers/accountFolderManagement");


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 200, // 200MB per file (adjust if needed)
  },
});
// ----- Folder Operations -----
// Create new folder

router.post("/folder", createFolder);

// Lock or unlock folder (read-only)

router.post("/folder/readonly", setReadOnly);

// Upload entire folder (multiple files + subfolders)

router.post("/folder/upload", handleFolderUpload);

router.post("/delete", deleteItem);

// ----- File Operations -----
// Upload single file to a specific folder

router.post("/file/upload", uploadFile);

// Lock or unlock a file (read-only)

router.post("/file/readonly", setFileReadOnly);

// ----- Metadata Operations -----
// Update metadata for file or folder (like invoiceId, tags, description, readOnly)

router.post("/meta", updateMeta);

// List folders/files
router.get("/list", listFolderContent);
router.get("/files/list", listFoldersAndFiles);
router.post(
  "/upload-folder",
  uploadFolder.single("folderZip"),
  uploadFolderZipFplder
);
// mergeUnzippedFolderToTarget
router.post(
  "/account-upload-folder",
  uploadFolder.single("folderZip"),
  mergeUnzippedFolderToTarget
);
router.get("/files/list/clientView", clientListFoldersAndFiles);
router.post("/move", moveItem);
router.post("/rename", renameItem);
router.post("/updateStatus", updateStatus);
router.post("/invoice/lock-unlock", lockUnlockInvoice);
router.post("/file/approval-toggle", toggleApprovalStatus);
router.post("/upload-folder-raw", upload.array("files"), uploadFolderRaw);
module.exports = router;

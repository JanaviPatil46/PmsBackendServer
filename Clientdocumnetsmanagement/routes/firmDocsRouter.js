const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createFolderInFirm,uploadFileInFirm,getFilesByAccountId,updatePermissions,downloadFile,deleteFile } = require("../controller/firmDocsController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // // Log and get destination path from the request body
    const destinationPath = req.body.destinationPath || "uploads"; // Default to 'uploads' if not provided
    console.log("test",destinationPath);

    // Set the destination path
    cb(null, destinationPath);

  },
  
  filename: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("Invalid file"), false);
    }
    cb(null, `${file.originalname}`);
  }
});

// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      console.log("Skipping empty file...");
      return cb(null, false);
    }
    cb(null, true);
  }
});
router.post("/uploadfileinfirm", upload.single("file"), uploadFileInFirm);
// Get files by accountId route
router.get("/files/:accountId", getFilesByAccountId);
router.post("/createFolderinfirm", createFolderInFirm);
router.patch("/permissions/:fileId", updatePermissions);
router.get("/download/:accountId/:filename", downloadFile);
router.delete("/delete/:accountId/:filename", deleteFile);
module.exports = router;

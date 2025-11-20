const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controller/oragnizerFileUpload');

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder for storing uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file naming
  },
});

const upload = multer({ storage });
const router = express.Router();

// File upload route
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;

// // multerConfig.js
// const multer = require('multer');
// const path = require('path');

// // Set up storage engine for Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Save files in the 'uploads' directory
//   },
//   filename: (req, file, cb) => {
//     // Use the original file name
//     cb(null, file.originalname);
//   },
// });

// // Initialize Multer
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
// }).array('attachments', 5); // Allow up to 5 files in the 'attachments' field

// module.exports = upload;



const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Temporary upload destination
const tempDir = 'uploads/temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Make filename unique
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).array('attachments', 5);

module.exports = upload;

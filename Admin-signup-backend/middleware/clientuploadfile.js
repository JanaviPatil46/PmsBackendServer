const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Set the directory to save the files
    },
    filename: function (req, file, cb) {
        const sanitizedFilename = file.originalname.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
        cb(null, `${Date.now()}-${sanitizedFilename}`);
    }
});

const uploadimg = multer({ storage: storage });

// module.exports = upload;  // Make sure upload is exported

module.exports = { uploadimg };

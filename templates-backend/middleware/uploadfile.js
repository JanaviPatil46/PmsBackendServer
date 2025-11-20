const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Use the defined upload directory
    },
    filename: function (req, file, cb) {
        const sanitizedFilename = file.originalname.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
        cb(null, `${Date.now()}-${sanitizedFilename}`); // Use sanitized filename
    }
});

const upload = multer({ storage: storage });
module.exports = upload;

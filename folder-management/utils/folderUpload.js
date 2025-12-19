const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const accountId = req.body.accountId;

    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      "accounts",
      accountId,
      "Private",
      path.dirname(file.originalname) // keep folder structure
    );

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;

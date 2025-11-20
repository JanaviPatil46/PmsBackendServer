const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dbconnect = require("./database/connectDb");
const app = express();

const fs = require('fs');
require("dotenv").config();
const multer = require('multer');
app.use(express.json());

app.use(cors());
// database connect
dbconnect();

// // Serve static files from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads", "avatar")));



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/avatar")); // Store in uploads/avatar
  },
  filename: (req, file, cb) => {
    const userId = req.query.userId; // Get userId from query params
    if (!userId) {
      return cb(new Error("User ID is required"), null);
    }
    cb(null, `${userId}.jpg`); // Save as userId.jpg
  },
});

const upload = multer({ storage });

app.post("/userprofilepic", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.status(200).json({ imageUrl: `/uploads/avatar/${req.file.filename}` });
});


app.get("/lastimage", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads/avatar"); // Corrected path

  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Unable to fetch files" });

    // Filter only avatar images (assuming naming convention includes .jpg)
    const avatarFiles = files.filter((file) => file.endsWith(".jpg"));

    if (avatarFiles.length === 0) {
      return res.status(404).json({ error: "No image found" });
    }

    // Sort files by modification time (latest first)
    avatarFiles.sort(
      (a, b) =>
        fs.statSync(path.join(uploadsDir, b)).mtime -
        fs.statSync(path.join(uploadsDir, a)).mtime
    );

    // Return the latest uploaded file
    res.status(200).json({
      imageUrl: `http://127.0.0.1:${PORT}/uploads/avatar/${avatarFiles[0]}`,
    });
  });
});


//! Common Routes
const userRoutes = require("./routes/userRoute");
app.use("/common", userRoutes);

//! otp
// const otpController = require("../../backend/Admin-signup-backend/middleware/otpController");
const otpController = require("../Admin-signup-backend/middleware/otpController");
app.use("/otp", otpController);
// snp_backend_01
// !client
// const clientsignupOTPmail = require("../../backend/Admin-signup-backend/middleware/clientsignupOTPmail");
const clientsignupOTPmail = require("../Admin-signup-backend/middleware/clientsignupOTPmail");
app.use("/clientsotp", clientsignupOTPmail);
// ! admin
// const adminRoutes = require("../../backend/Admin-signup-backend/routes/adminRoutes");
const adminRoutes = require("../Admin-signup-backend/routes/adminRoutes");
app.use("/admin", adminRoutes);

// const usersavedemail = require("../../backend/Admin-signup-backend/middleware/usersavedemail");
const usersavedemail = require("../Admin-signup-backend/middleware/usersavedemail");
app.use("/usersemail", usersavedemail);

//! resetpassword
const resetpassword = require("./controller/resetPasswordController");
app.use("/resetpass", resetpassword);

//! resetpassword
const teammemberpasswordupdate = require("../Admin-signup-backend/middleware/teammemberpasswordupdate");
app.use("/teamresetpass", teammemberpasswordupdate);

//!  Routes
const passwordupdateemail = require("../Admin-signup-backend/middleware/passwordupdatemail");
app.use("/updatepass", passwordupdateemail);

//! EmailTemplate Routes
const clientsavedemail = require("../Admin-signup-backend/middleware/clientsavedEmail");
app.use("/clientmail", clientsavedemail);

//! EmailTemplate Routes
const teammembersavedemail = require("../Admin-signup-backend/middleware/teamMembersendInviteEmail");
app.use("/teamemail", teammembersavedemail);

const emailsync = require("../Admin-signup-backend/middleware/emailsync");
// ../Admin-signup-backend/middleware/emailsync
app.use("/emailsynk", emailsync);


// firmsettinga
const firmsetting = require("./routes/firmsettingRoutes");
app.use("/adminfirm", firmsetting);


app.use('/profilepicture', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`connection is live at port no. ${PORT}`);
});

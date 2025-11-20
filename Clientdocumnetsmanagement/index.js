

// Backend (server/index.js)
const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");  // Import CORS middleware
const app = express();
const dbconnect = require("./mogodb/db");
const File = require("./models/FileModel")
const clientRoutes = require('./routes/clientsRoutes');
// const clientDocRoutes = require("./Routes.js/ClientRoutes")
const adminRoutes = require("./routes/AdminRoutes")
const firmDocsRoutes = require("./routes/firmDocsRouter")
// app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend to access API
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001','http://localhost:3000','https://snptaxes.com'], // allow both
  methods: ['GET', 'POST', 'PATCH','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Allows parsing JSON body
app.use(express.urlencoded({ extended: true })); // Allows parsing form data
const nodemailer = require("nodemailer");



require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Set up Nodemailer transporter
 const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

// Middleware to dynamically store files
// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // // Log and get destination path from the request body
    const destinationPath = req.body.destinationPath || "uploads"; // Default to 'uploads' if not provided
    console.log(destinationPath);

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
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      console.log("Skipping empty file...");
      return cb(null, false);
    }
    cb(null, true);
  }
});
dbconnect();



app.post("/upload-folder", upload.single("folderZip"), async (req, res) => {
  if (!req.file || !req.body.folderName || !req.body.destinationPath) {
    return res.status(400).json({ error: "Missing file, folder name, or destination path" });
  }

  const folderName = req.body.folderName;
  const destinationPath = req.body.destinationPath;
  const zipPath = req.file.path;
  const extractPath = path.join(  destinationPath, folderName);
console.log(extractPath)
  try {
    console.log("Extracting:", zipPath, "to", extractPath);
    await fs.ensureDir(extractPath);

    const zipStream = fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }));

    zipStream.on("close", async () => {
      try {
        await fs.unlink(zipPath);
        console.log("Deleted ZIP file:", zipPath);
        res.json({ 
          message: "Folder extracted successfully!", 
          path: extractPath,
          destination: destinationPath 
        });
      } catch (unlinkError) {
        console.error("Error deleting ZIP:", unlinkError);
        res.status(500).json({ error: "Extraction completed, but ZIP deletion failed" });
      }
    });

    zipStream.on("error", async (err) => {
      console.error("Extraction error:", err);
      await fs.unlink(zipPath);
      res.status(500).json({ error: "Extraction failed, ZIP deleted" });
    });

  } catch (error) {
    console.error("Server error:", error);
    await fs.unlink(zipPath);
    res.status(500).json({ error: "Server error, ZIP deleted" });
  }
});
app.get("/getFolders", async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, "uploads");

    // Check if the directory exists
    if (!fs.existsSync(uploadsPath)) {
      return res.status(404).send({ message: "Uploads directory not found" });
    }

    // Read the directory contents and filter out only folders
    const items = await fs.readdir(uploadsPath, { withFileTypes: true });
    const folders = items
      .filter((item) => item.isDirectory())
      .map((folder) => folder.name);

    res.status(200).send({ folders });
  } catch (error) {
    console.error("Error getting folders:", error);
    res.status(500).send({ error: "Failed to retrieve folders" });
  }
});
app.get("/getFoldersWithContents", async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, "uploads", "AccountId");

    if (!fs.existsSync(uploadsPath)) {
      return res.status(404).send({ message: "Uploads directory not found" });
    }

    // Function to get folder structure
    const getFolderContents = (dirPath) => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      return items.map((item) => {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          return {
            id: fullPath, // Unique ID
            folder: item.name,
            isOpen: false, // Default closed
            contents: getFolderContents(fullPath), // Recursively fetch contents
          };
        } else {
          return { id: fullPath, file: item.name };
        }
      });
    };

    const folders = getFolderContents(uploadsPath);

    res.status(200).json({ folders });
  } catch (error) {
    console.error("Error retrieving folders:", error);
    res.status(500).json({ error: "Failed to retrieve folders and files" });
  }
});




app.get("/allFolders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uploadsPath = path.join(__dirname, `./uploads/AccountId/${id}/Client Uploaded Documents/unsealed`);

    const getAllItems = async (dir) => {
      const items = await fs.readdir(dir);
      const itemsPromises = items.map(async (item) => {
        const itemPath = path.join(dir, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
          const subItems = await getAllItems(itemPath);
          return { folder: item, contents: subItems };
        } else {
          return { file: item };
        }
      });
      return Promise.all(itemsPromises);
    };

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching all folders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/uploadfiledocument", upload.single("file"), (req, res) => {
  // Extract path from the form data
  let targetPath = req.body.destinationPath;
  // Replace all occurrences of '//' with '/'
  targetPath = targetPath.replace(/\/\//g, "/");
console.log(targetPath)
  if (!targetPath) {
    return res
      .status(400)
      .send({ message: "Path is required in the request body." });
  }

  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }
  res.status(200).send({
    message: "File uploaded successfully!",
    // filePath: `${targetPath}/${req.file.filename}`,
  });
});

//app.post("/clientuploadedfiledocument", upload.single("file"), async (req, res) => {
 // try {
    // Extract path from the form data
   // let targetPath = req.body.destinationPath;
   // let accountName = req.body.accountName; // Assume you send this from frontend
   // targetPath = targetPath.replace(/\/\//g, "/");

   // console.log(targetPath);

   // if (!targetPath) {
    //  return res
       // .status(400)
       // .send({ message: "Path is required in the request body." });
  //  }

   // if (!req.file) {
    //  return res.status(400).send({ message: "No file uploaded." });
   // }

    // Send email notification to Admin
   // const mailOptions = {
     // from: "youradminemail@gmail.com",   // Sender address
    //  to: "adminrecipientemail@gmail.com", // Admin email address
     // subject: "New Document Uploaded",
     // html: `
      //  <h2>New Document Uploaded</h2>
       // <p><strong>Account Name:</strong> ${accountName}</p>
      //  <p><strong>File Name:</strong> ${req.file.originalname}</p>
       // <p>Destination Path: ${targetPath}</p>
     // `,
   // };

    //await transporter.sendMail(mailOptions);

   // res.status(200).send({
    //  message: "File uploaded successfully and email sent to admin!",
      // filePath: `${targetPath}/${req.file.filename}`,
   // });
 // } catch (error) {
    //console.error("Error uploading file or sending email:", error);
   // res.status(500).send({ message: "Error uploading file or sending email." });
 // }
//});
app.post("/clientuploadedfiledocument", upload.single("file"), async (req, res) => {
  try {
    // Extract path from the form data
    let targetPath = req.body.destinationPath;
    let accountName = req.body.accountName; // Assume you send this from frontend
    let accountEmailSync = req.body.accountEmailSync;
    targetPath = targetPath.replace(/\/\//g, "/");

    console.log(accountEmailSync);
console.log("targetPath",targetPath);
    if (!targetPath) {
      return res
        .status(400)
        .send({ message: "Path is required in the request body." });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    // Send email notification to Admin
    const mailOptions = {
      from: `<${process.env.EMAIL}>`,   // Sender address
      to: accountEmailSync, // Admin email address
      subject: "#New Document Uploaded",
      html: `
        <h2>New Document Uploaded</h2>
        <p><strong>Account Name:</strong> ${accountName}</p>
        <p><strong>File Name:</strong> ${req.file.originalname}</p>
        <p>Destination Path: ${targetPath}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({
      message: "File uploaded successfully and email sent to admin!",
      // filePath: `${targetPath}/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Error uploading file or sending email:", error);
    res.status(500).send({ message: "Error uploading file or sending email." });
  }
});
app.post("/uploadfileinfirm", upload.single("file"), async (req, res) => {
  // Extract the file path and permissions from the request
  let targetPath = req.body.destinationPath;
  const accountId = req.body.accountId;
  console.log("jjjj",targetPath)
  // Default permissions if not provided by user
  const defaultPermissions = {
    canView: true,
    canDownload: true,
    canDelete: false,
    canUpdate: false,
  };

  // Use user-provided permissions or fall back to defaults
  const permissions = req.body.permissions || defaultPermissions;

  // Replace all occurrences of '//' with '/'
  targetPath = targetPath.replace(/\/\//g, "/");

  console.log("Vinayak");

  if (!targetPath) {
    return res.status(400).send({ message: "Path is required in the request body." });
  }

  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  // Create a new file document with permissions
  const newFile = new File({
    filename: req.file.filename,
    filePath: targetPath,
    accountId,
    permissions: {
      canView: permissions.canView,
      canDownload: permissions.canDownload,
      canDelete: permissions.canDelete,
      canUpdate: permissions.canUpdate,
    },
  });

  try {
    // Save the file and permissions to MongoDB
    await newFile.save();
    res.status(200).send({
      message: "File uploaded successfully!",
      filePath: `/${targetPath}/${req.file.filename}`,
      accountId,
      permissions: newFile.permissions,
    });
  } catch (error) {
    res.status(500).send({ message: "Error saving file to database.", error: error.message });
  }
});
app.post("/createFolderinfirm", async (req, res) => {
  try {
    const folderName = req.query.foldername;
    const folderPath = req.query.path;
    const accountId = req.query.accountId || req.body.accountId;

    // Basic validations
    if (!folderName || !folderPath || !accountId) {
      return res.status(400).send({
        error: "foldername, path, and accountId are required",
      });
    }

    if (folderPath.includes("..")) {
      return res.status(400).send({ error: "Invalid folder path" });
    }

    // Build the full and normalized path
    const relativeSubPath = folderPath.replace(/^.*AccountId\//, "");
    const basePath = path.join(__dirname, "uploads", "AccountId");
    const finalFolderPath = path.join(basePath, relativeSubPath, folderName);
    const normalizedFolderPath = finalFolderPath.replace(/\\/g, "/");

    // Create the folder recursively
    await fs.mkdir(normalizedFolderPath, { recursive: true });

    // Create a default file inside the folder
    const defaultFileName = "#$default.txt";
    const fullFilePath = path.join(normalizedFolderPath, defaultFileName);
    await fs.writeFile(fullFilePath, "");

    // Prepare relative path for DB entry
    const relativeFilePath = fullFilePath
      .replace(path.join(__dirname, "/"), "")
      .replace(/\\/g, "/");

    // Handle permissions
    const defaultPermissions = {
      canView: true,
      canDownload: true,
      canDelete: false,
      canUpdate: false,
    };

    const permissions = req.body.permissions || defaultPermissions;

    // Save file metadata to database
    const newFile = new File({
      filename: defaultFileName,
      filePath: normalizedFolderPath,
      accountId: accountId,
      permissions,
    });

    await newFile.save();

    // Respond with success
    return res.status(200).send({
      message: "Folder and default.txt file created successfully!",
      folderPath: relativeFilePath.replace(`/${defaultFileName}`, ""),
      permissions: newFile.permissions,
    });

  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).send({ error: "Failed to create folder" });
  }
});


// API to create a folder
app.get("/createnewFolder", async (req, res) => {
  try {
    const folderName = req.query.foldername; // Folder name
    const folderPath = req.query.path; // Path

    if (!folderName || !folderPath) {
      return res
        .status(400)
        .send({ error: "Both folder name and path are required" });
    }

    // Resolve the full path safely
    const fullPath = path.resolve(__dirname, folderPath, folderName);

    // Create the folder (recursive: true allows nested folder creation)
    await fs.mkdir(fullPath, { recursive: true });

    console.log("Folder created at:", fullPath);
    res.send({ message: "Folder created successfully", fullPath });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send({ error: "Failed to create folder" });
  }
});

// Serve files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Helper function to recursively get directory contents
async function getDirectoryContents(dirPath) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  const contents = await Promise.all(items.map(async (item) => {
    const itemPath = path.join(dirPath, item.name);
    const itemInfo = {
      name: item.name,
      type: item.isDirectory() ? 'folder' : 'file',
      path: itemPath.replace(__dirname, '') // Relative path for security
    };

    if (item.isDirectory()) {
      itemInfo.contents = await getDirectoryContents(itemPath);
    }

    return itemInfo;
  }));

  return contents;
}

app.get("/getSealedContent/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const sealedPath = path.join(
      __dirname,
      "uploads",
      "AccountId",
      clientId,
      "Client Uploaded Documents",
      "sealed"
    );

    // Check if the directory exists
    try {
      await fs.access(sealedPath);
    } catch {
      return res.status(404).json({ 
        success: false,
        message: "Sealed directory not found" 
      });
    }

    const contents = await getDirectoryContents(sealedPath);
    
    res.status(200).json({
      success: true,
      path: sealedPath.replace(__dirname, ''),
      contents
    });
  } catch (error) {
    console.error("Error getting sealed content:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve sealed content",
      details: error.message 
    });
  }
});

app.get("/getUnsealedContent/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;
    const unsealedPath = path.join(
      __dirname,
      "uploads",
      "AccountId",
      clientId,
      "Client Uploaded Documents",
      "unsealed"
    );

    // Check if the directory exists
    try {
      await fs.access(unsealedPath);
    } catch {
      return res.status(404).json({ 
        success: false,
        message: "Unsealed directory not found" 
      });
    }

    const contents = await getDirectoryContents(unsealedPath);
    
    res.status(200).json({
      success: true,
      path: unsealedPath.replace(__dirname, ''),
      contents
    });
  } catch (error) {
    console.error("Error getting unsealed content:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve unsealed content",
      details: error.message 
    });
  }
});


// Route to get all files
app.get('/api/files', async (req, res) => {
  
  try {
    const files = await File.find({}); // Fetch all files

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});
async function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (let entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await deleteDirectory(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
    fs.rmdirSync(dirPath);
  }
}

app.post("/movefile", async (req, res) => {
  try {
    let { sourcePath, destinationPath } = req.body;

    if (!sourcePath || !destinationPath) {
      return res
        .status(400)
        .json({ error: "sourcePath and destinationPath are required" });
    }

    const absoluteSource = path.resolve(sourcePath);
    const absoluteDestinationFolder = path.resolve(destinationPath);

    // Get stats to check if it's file or folder
    const stats = fs.statSync(absoluteSource);

    if (stats.isDirectory()) {
      // ? Move entire folder
      const folderName = path.basename(absoluteSource);
      const finalDestination = path.join(absoluteDestinationFolder, folderName);

      await copyDirectory(absoluteSource, finalDestination);
      await deleteDirectory(absoluteSource);

      return res.json({
        message: "Folder moved successfully",
        oldPath: absoluteSource,
        newPath: finalDestination,
      });
    } else {
      // ? Move single file
      const fileName = path.basename(absoluteSource);
      const finalDestination = path.join(absoluteDestinationFolder, fileName);

      if (!fs.existsSync(absoluteDestinationFolder)) {
        fs.mkdirSync(absoluteDestinationFolder, { recursive: true });
      }

      fs.copyFileSync(absoluteSource, finalDestination);
      fs.unlinkSync(absoluteSource);

      return res.json({
        message: "File moved successfully",
        oldPath: absoluteSource,
        newPath: finalDestination,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});




app.use("/admindocs", adminRoutes)
app.use('/clientdocs', clientRoutes);
app.use('/firmDocs',firmDocsRoutes)
const approvalRoutes = require("./routes/approvalRoutes");

app.use("/approvals", approvalRoutes);

app.listen(8006, () => console.log("Server running on port 8006"));

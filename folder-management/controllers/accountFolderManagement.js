//const fs = require("fs");
const fs = require("fs-extra");
const path = require("path");
const multer = require("multer");
const unzipper = require("unzipper");
const stream = require("stream");
const fse = require("fs-extra"); // safer recursive copy/delete
const InvoiceLock = require("../models/InvoiceLock");
const Approvals = require("../models/Approval");
const EsignRequests = require("../models/EsignRequest");
// ============================
// ?? Base Upload Path & Helpers
// ============================
const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads/accounts");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function getMetaPath(folderPath, fileName = null) {
  ensureDir(folderPath);
  return fileName
    ? path.join(folderPath, `${fileName}.meta.json`)
    : path.join(folderPath, "folder.meta.json");
}

function readMeta(folderPath, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  if (fs.existsSync(metaPath)) {
    try {
      return JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (err) {
      console.error("Error reading metadata:", metaPath, err);
      return {};
    }
  }
  return {};
}

function writeMeta(folderPath, data, fileName = null) {
  const metaPath = getMetaPath(folderPath, fileName);
  try {
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing metadata:", metaPath, err);
  }
}
// Multer memory storage
const storageFolderzip = multer.memoryStorage();
const uploadFolder = multer({
  storage: storageFolderzip, // FIXED
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      console.log("Skipping empty file...");
      return cb(null, false);
    }
    cb(null, true);
  },
});

// ?? MAIN CONTROLLER
const uploadFolderZipFplder = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing ZIP file" });

    const folderPath = req.body.folderPath || "";
      const extractPath = path.join(__dirname, "../uploads/accounts", folderPath);

        try {
            console.log("Extracting ZIP to:", extractPath);
                await fs.ensureDir(extractPath);

                    await extractZipWithoutRoot(req.file.buffer, extractPath); // ? new extraction
                        await removeDoubleFolder(extractPath); // ? FIX test/test issue

    await createMetaForFilesAndFoldersDetailed(extractPath); // ? your META generator

    return res.json({
      message: "Folder extracted and META created successfully",
      path: extractPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Extraction server error" });
  }
};


// jan v 
// const mergeUnzippedFolderToTarget = async (req, res) => {

//   console.log("jan v kujaki");
//   if (!req.file) return res.status(400).json({ error: "Missing ZIP file" });

//   const targetPath = path.join(
//     __dirname,
//     "../uploads/accounts",
//     req.body.folderPath || ""
//   );

//   try {
//     await fs.ensureDir(targetPath);
//     console.log("Extracting ZIP into:", targetPath);

//     const directory = await unzipper.Open.buffer(req.file.buffer);

//     for (const entry of directory.files) {
//       let p = entry.path.replace(/\\/g, "/");

//       // ignore junk
//       if (!p || p.startsWith("__MACOSX")) continue;

//       const parts = p.split("/").filter(Boolean);

//       // 🔥 DROP ROOT FOLDER ALWAYS
//       parts.shift();

//       if (!parts.length) continue;

//       // ❌ IGNORE DIRECTORY ENTRIES COMPLETELY
//       if (entry.type === "Directory") continue;

//       const finalPath = path.join(targetPath, ...parts);

//       // ✅ folders created ONLY from file paths
//       await fs.ensureDir(path.dirname(finalPath));
//       entry.stream().pipe(fs.createWriteStream(finalPath));
//     }

//     await createMetaForFilesAndFoldersDetailed(targetPath);

//     res.json({
//       message: "ZIP extracted correctly (no root folder)",
//       targetPath,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };
// const mergeUnzippedFolderToTarget = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Missing ZIP file" });
//     }

//     const targetPath = path.join(
//       __dirname,
//       "../uploads/accounts",
//       req.body.folderPath || ""
//     );

//     await fs.ensureDir(targetPath);
//     console.log("Extracting ZIP into:", targetPath);

//     const directory = await unzipper.Open.buffer(req.file.buffer);

//     // -------------------------
//     // Detect top-level entries in ZIP
//     // -------------------------
//     const topLevelNames = new Set();
//     directory.files.forEach((f) => {
//       if (f.path && !f.path.startsWith("__MACOSX")) {
//         const parts = f.path.replace(/\\/g, "/").split("/").filter(Boolean);
//         if (parts.length > 0) topLevelNames.add(parts[0]);
//       }
//     });

//     let removeRoot = topLevelNames.size === 1; // only remove root if single folder

//     // -------------------------
//     // Extract all entries
//     // -------------------------
//     for (const entry of directory.files) {
//       let entryPath = entry.path.replace(/\\/g, "/");

//       if (!entryPath || entryPath.startsWith("__MACOSX")) continue;

//       let parts = entryPath.split("/").filter(Boolean);

//       // Remove root folder if only one top-level folder exists
//       if (removeRoot) {
//         parts.shift();
//       }

//       if (!parts.length) continue;

//       const finalPath = path.join(targetPath, ...parts);

//       if (entry.type === "Directory") {
//         await fs.ensureDir(finalPath);
//         continue;
//       }

//       await fs.ensureDir(path.dirname(finalPath));

//       await new Promise((resolve, reject) => {
//         entry
//           .stream()
//           .pipe(fs.createWriteStream(finalPath))
//           .on("finish", resolve)
//           .on("error", reject);
//       });
//     }

//     // -------------------------
//     // Update metadata
//     // -------------------------
//     await createMetaForFilesAndFoldersDetailed(targetPath);

//     res.json({
//       success: true,
//       message: "ZIP extracted successfully (no extra root folder)",
//       targetPath,
//     });
//   } catch (err) {
//     console.error("ZIP extract error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to extract ZIP",
//       details: err.message,
//     });
//   }
// }; // working only unzip functionality 





// const mergeUnzippedFolderToTarget = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Missing ZIP file" });
//     }

//     const targetPath = path.join(
//       __dirname,
//       "../uploads/accounts",
//       req.body.folderPath || ""
//     );

//     await fs.ensureDir(targetPath);
//     console.log("Extracting ZIP into:", targetPath);

//     const directory = await unzipper.Open.buffer(req.file.buffer);

//     // Detect top-level entries in ZIP
//     const topLevelNames = new Set();
//     directory.files.forEach((f) => {
//       if (f.path && !f.path.startsWith("__MACOSX")) {
//         const parts = f.path.replace(/\\/g, "/").split("/").filter(Boolean);
//         if (parts.length > 0) topLevelNames.add(parts[0]);
//       }
//     });

//     const removeRoot = topLevelNames.size === 1;

//     // Temporary extraction folder (to handle move)
//     // Use parent of targetPath to prevent extra root folder
//     const parentPath = path.dirname(targetPath);
//     const tempExtractPath = parentPath;
//     await fs.ensureDir(tempExtractPath);

//     // Extract all entries to temp folder first
//     for (const entry of directory.files) {
//       let entryPath = entry.path.replace(/\\/g, "/");

//       if (!entryPath || entryPath.startsWith("__MACOSX")) continue;

//       let parts = entryPath.split("/").filter(Boolean);

//       if (removeRoot) parts.shift(); // remove root folder if single root

//       if (!parts.length) continue;

//       const finalPath = path.join(tempExtractPath, ...parts);

//       if (entry.type === "Directory") {
//         await fs.ensureDir(finalPath);
//         continue;
//       }

//       await fs.ensureDir(path.dirname(finalPath));

//       await new Promise((resolve, reject) => {
//         entry
//           .stream()
//           .pipe(fs.createWriteStream(finalPath))
//           .on("finish", resolve)
//           .on("error", reject);
//       });
//     }

//     // -------------------------
//     // Remove extra root folder if it exists
//     // -------------------------
//     if (removeRoot) {
//       const extraRootFolder = path.join(parentPath, [...topLevelNames][0]);
//       if (await fs.pathExists(extraRootFolder)) {
//         await fs.remove(extraRootFolder);
//         console.log("Deleted extra root folder:", extraRootFolder);
//       }
//     }

//     res.json({
//       success: true,
//       message: "ZIP extracted and contents moved successfully",
//       targetPath,
//     });
//   } catch (err) {
//     console.error("ZIP extract error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to extract ZIP",
//       details: err.message,
//     });
//   }
// };  wrking fine only metafile is not creted 

const mergeUnzippedFolderToTarget = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing ZIP file" });
    }

    const targetPath = path.join(
      __dirname,
      "../uploads/accounts",
      req.body.folderPath || ""
    );

    await fs.ensureDir(targetPath);
    console.log("Extracting ZIP into:", targetPath);

    const directory = await unzipper.Open.buffer(req.file.buffer);

    // Detect top-level entries in ZIP
    const topLevelNames = new Set();
    directory.files.forEach((f) => {
      if (f.path && !f.path.startsWith("__MACOSX")) {
        const parts = f.path.replace(/\\/g, "/").split("/").filter(Boolean);
        if (parts.length > 0) topLevelNames.add(parts[0]);
      }
    });

    const removeRoot = topLevelNames.size === 1;

    // Temporary extraction folder (to handle move)
    // Use parent of targetPath to prevent extra root folder
    const parentPath = path.dirname(targetPath);
    const tempExtractPath = parentPath;
    await fs.ensureDir(tempExtractPath);

    // Extract all entries to temp folder first
    for (const entry of directory.files) {
      let entryPath = entry.path.replace(/\\/g, "/");

      if (!entryPath || entryPath.startsWith("__MACOSX")) continue;

      let parts = entryPath.split("/").filter(Boolean);

      if (removeRoot) parts.shift(); // remove root folder if single root

      if (!parts.length) continue;

      const finalPath = path.join(tempExtractPath, ...parts);

      if (entry.type === "Directory") {
        await fs.ensureDir(finalPath);
        continue;
      }

      await fs.ensureDir(path.dirname(finalPath));

      await new Promise((resolve, reject) => {
        entry
          .stream()
          .pipe(fs.createWriteStream(finalPath))
          .on("finish", resolve)
          .on("error", reject);
      });
    }
  

    // -------------------------
    // Remove extra root folder if it exists
    // -------------------------
    if (removeRoot) {
      const extraRootFolder = path.join(parentPath, [...topLevelNames][0]);
      if (await fs.pathExists(extraRootFolder)) {
        await fs.remove(extraRootFolder);
        console.log("Deleted extra root folder:", extraRootFolder);
      }
    }

    // -------------------------
    // Create meta files for all extracted folders/files

    // -------------------------

   // console.log("hi how are you ",tempExtractPath);

      await createMetaForFilesAndFoldersDetailed(tempExtractPath);
    

    res.json({
      success: true,
      message: "ZIP extracted and contents moved successfully",
      targetPath,
    });
  } catch (err) {
    console.error("ZIP extract error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to extract ZIP",
      details: err.message,
    });
  }
};




// const mergeUnzippedFolderToTarget = async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "Missing ZIP file" });

//   const targetPath = path.join(
//     __dirname,
//     "../uploads/accounts",
//     req.body.folderPath || ""
//   );

//   try {
//     await fs.ensureDir(targetPath);
//     console.log("Extracting ggggg ZIP into:", targetPath);

//     const directory = await unzipper.Open.buffer(req.file.buffer);

//     for (const entry of directory.files) {
//       let p = entry.path.replace(/\\/g, "/");

//       // ignore junk
//       if (!p || p.startsWith("__MACOSX")) continue;

//       const segments = p.split("/").filter(Boolean);

//       // 🔥 ALWAYS REMOVE FIRST SEGMENT
//       segments.shift();

//       // nothing left? skip
//       if (!segments.length) continue;

//       const finalPath = path.join(targetPath, ...segments);

//       if (entry.type === "Directory") {
//         await fs.ensureDir(finalPath);
//       } else {
//         await fs.ensureDir(path.dirname(finalPath));
//         entry.stream().pipe(fs.createWriteStream(finalPath));
//       }
//     }

//     await createMetaForFilesAndFoldersDetailed(targetPath);

//     res.json({
//       message: "ZIP extracted, root folder nuked 🔥",
//       targetPath,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };






// const mergeUnzippedFolderToTarget = async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "Missing ZIP file" });

//   const folderPath = req.body.folderPath || "";
//   const extractPath = path.join(__dirname, "../uploads/temp", Date.now().toString());
//   const targetPath = path.join(__dirname, "../uploads/accounts", folderPath);

//   try {
//     console.log("Extracting ZIP to temp:", extractPath);
//     await fs.ensureDir(extractPath);

//     // 1️⃣ Extract ZIP directly
//     await new Promise((resolve, reject) => {
//       const zip = unzipper.Parse();
      
//       zip.on("entry", async (entry) => {
//         const fullPath = path.join(extractPath, entry.path);
        
//         if (entry.type === "Directory") {
//           await fs.ensureDir(fullPath);
//           entry.autodrain();
//         } else {
//           await fs.ensureDir(path.dirname(fullPath));
//           entry.pipe(fs.createWriteStream(fullPath));
//         }
//       });
      
//       zip.on("close", resolve);
//       zip.on("error", reject);
      
//       const pass = new stream.PassThrough();
//       pass.end(req.file.buffer);
//       pass.pipe(zip);
//     });

//     // 2️⃣ Find the actual source content (skip the outer folder if only one exists)
//     let sourceContentPath = extractPath;
//     const items = await fs.readdir(extractPath);
    
//     if (items.length === 1) {
//       const possibleFolder = path.join(extractPath, items[0]);
//       const stat = await fs.stat(possibleFolder);
//       if (stat.isDirectory()) {
//         sourceContentPath = possibleFolder;
//         console.log("Using content from folder:", items[0]);
//       }
//     }

//     // 3️⃣ Ensure target exists
//     await fs.ensureDir(targetPath);

//     // 4️⃣ Copy all items from sourceContentPath to targetPath
//     const itemsToCopy = await fs.readdir(sourceContentPath);
    
//     for (const item of itemsToCopy) {
//       const src = path.join(sourceContentPath, item);
//       const dest = path.join(targetPath, item);
//       await fs.copy(src, dest, { overwrite: true });
//       console.log(`Copied: ${item}`);
//     }

//     // 5️⃣ Create META
//     await createMetaForFilesAndFoldersDetailed(targetPath);

//     // 6️⃣ Cleanup
//     await fs.remove(extractPath);

//     return res.json({
//       message: "Folder contents copied successfully",
//       targetPath: targetPath,
//       itemsCopied: itemsToCopy.length,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     if (await fs.pathExists(extractPath)) {
//       await fs.remove(extractPath);
//     }
//     res.status(500).json({ error: "Extraction error: " + error.message });
//   }
// };
// const mergeUnzippedFolderToTarget = async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "Missing ZIP file" });

//   const folderPath = req.body.folderPath || "";     // target folder
//   const extractPath = path.join(__dirname, "../uploads/temp", Date.now().toString());
//   const targetPath = path.join(__dirname, "../uploads/accounts", folderPath);

//   try {
//     console.log("Extracting ZIP to temp:", extractPath);
//     await fs.ensureDir(extractPath);

//     // 1️⃣ Unzip to temp
//     await extractZipWithoutRoot(req.file.buffer, extractPath);
//     await removeDoubleFolder(extractPath); // handles test/test.zip issue

//     // 2️⃣ Ensure target folder exists
//     await fs.ensureDir(targetPath);

//     // 3️⃣ COPY ONLY CONTENTS INSIDE UNZIPPED FOLDER
//     const extractedItems = await fs.readdir(extractPath);
//     for (const item of extractedItems) {
//       const src = path.join(extractPath, item);
//       const dest = path.join(targetPath, item);

//       await fs.copy(src, dest, { overwrite: true });
//     }

//     // 4️⃣ Create META in target folder
//     await createMetaForFilesAndFoldersDetailed(targetPath);

//     // 5️⃣ Cleanup temp
//     await fs.remove(extractPath);

//     return res.json({
//       message: "Folder contents copied successfully",
//       path: targetPath,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Extraction server error" });
//   }
// };

// ----------------------------------------------
// ?? Extract ZIP while removing Top Parent Folder
// ----------------------------------------------
function extractZipWithoutRoot(buffer, outputPath) {
  return new Promise((resolve, reject) => {
    const zip = unzipper.Parse();

    zip.on("entry", async (entry) => {
      const original = entry.path.replace(/\\/g, "/");
      const clean = original.split("/").slice(1).join("/"); // remove root folder level

      if (!clean) return entry.autodrain();

      const fullPath = path.join(outputPath, clean);

      if (entry.type === "Directory") {
        await fs.ensureDir(fullPath);
        entry.autodrain();
      } else {
        await fs.ensureDir(path.dirname(fullPath));
        entry.pipe(fs.createWriteStream(fullPath));
      }
    });

    zip.on("close", resolve);
    zip.on("error", reject);

    const pass = new stream.PassThrough();
    pass.end(buffer);
    pass.pipe(zip);
  });
}

// --------------------------------------------------
// ?? Remove nested Duplicate Folder (test/test issue)
// --------------------------------------------------
async function removeDoubleFolder(mainPath) {
  const rootItems = await fs.readdir(mainPath);
  if (rootItems.length !== 1) return; // only flatten if single folder exists

  const first = path.join(mainPath, rootItems[0]);
  if (!(await fs.stat(first)).isDirectory()) return;

  const inside = await fs.readdir(first);

  if (
    inside.length === 1 &&
    (await fs.stat(path.join(first, inside[0]))).isDirectory()
  ) {
    const nested = path.join(first, inside[0]);
    console.log("? Found double nested folder ? Fixing...");

    await fs.copy(nested, mainPath);
    await fs.remove(first);

    console.log("? Fixed double folder structure");
  }
}
function formatUploadedDate(date = new Date()) {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/,/g, "")
    .toUpperCase()
    .replace(" ", "-");
}

// --------------------------------------------------
// ?? Your original META creation (unchanged)
// --------------------------------------------------
async function createMetaForFilesAndFoldersDetailed(
  folderPath,
  folderRelativePath = ""
) {
  const items = await fs.readdir(folderPath, { withFileTypes: true });

  const folderName = path.basename(folderPath);
  const currentFolderPath = path
    .join(folderRelativePath, folderName)
    .replace(/\\/g, "/");

  const folderMeta = {
    name: folderName,
    path: currentFolderPath,
    updatedAt: new Date().toISOString(),
    files: [],
    folders: [],
  };

  for (const item of items) {
    const fullPath = path.join(folderPath, item.name);

    if (item.isDirectory()) {
      const subMeta = await createMetaForFilesAndFoldersDetailed(
        fullPath,
        currentFolderPath
      );
      folderMeta.folders.push(subMeta);

      await fs.writeFile(
        path.join(fullPath, `${item.name}.meta.json`),
        JSON.stringify(subMeta, null, 2)
      );
    } else {
      const stat = await fs.stat(fullPath);

      const fileMeta = {
        name: item.name,
        size: stat.size,
        uploadedAt: formatUploadedDate,
        folder: currentFolderPath,
        uploadedBy: "system",
        readOnly: false,
        readStatus: false,
        signStatus: "",
        authStatus: "",
      };

      await fs.writeFile(
        fullPath + ".meta.json",
        JSON.stringify(fileMeta, null, 2)
      );
      folderMeta.files.push(fileMeta);
    }
  }

  await fs.writeFile(
    path.join(folderPath, `${folderName}.meta.json`),
    JSON.stringify(folderMeta, null, 2)
  );

  return folderMeta;
}

// ============================
// ?? Multer Storage
// ============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    ensureDir(folderPath);
    if (readMeta(folderPath).readOnly)
      return cb(new Error("Folder is read-only"));
    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");

    let originalName = file.originalname;
    let filename = originalName;
    let ext = path.extname(originalName);
    let name = path.basename(originalName, ext);

    let counter = 1;
    let fullPath = path.join(folderPath, filename);

    // If file exists ? add (1), (2), (3)...
    while (fs.existsSync(fullPath)) {
      filename = `${name}(${counter})${ext}`;
      fullPath = path.join(folderPath, filename);
      counter++;
    }

    cb(null, filename); // final safe name returned
  },
});

// For folder upload (multiple files)
const storageFolder = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    const targetPath = path.join(folderPath, path.dirname(file.originalname)); // preserve subfolders
    ensureDir(targetPath);
    if (readMeta(folderPath).readOnly)
      return cb(new Error("Folder is read-only"));
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname));
  },
});

//const uploadSingle = multer({ storage: storageSingle });
// Initialize multer
const upload = multer({ storage });
const uploadMultiple = multer({ storage: storageFolder });

// Load metadata JSON for a file
function loadMetadata(documentPath) {
  const metaPath = path.join(BASE_UPLOAD_PATH, documentPath + ".meta.json");

  if (!fs.existsSync(metaPath)) return null;

  const raw = fs.readFileSync(metaPath, "utf8");
  return { meta: JSON.parse(raw), metaPath };
}

// Save updated metadata to disk
function saveMetadata(metaPath, data) {
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2), "utf8");
}
const sendEmail = require("../utils/sendEmail.js");
const clientAccount = require("../models/AccountNewModel.js");
const User = require("../models/userModel.js");

const nodemailer = require("nodemailer");
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const handleFileUpload = [
  upload.array("files", 20), // Accept up to 20 files

  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: "No file(s) uploaded" });

      // Get accountId sent from frontend
      const accountId = req.body.accountId;
      console.log("Account ID:", accountId);

      // 1?? Fetch account with admin user populated
      let account = null;

      if (accountId) {
        account = await clientAccount
          .findById(accountId)
          .populate({
            path: "adminUserId",
            model: "User",
            select: "emailSyncEmail email username",
          })
          .lean();

        console.log("Account:", account);
        console.log(
          "account.adminUserId.emailSyncEmail",
          account.adminUserId.emailSyncEmail
        );
      }

      // 2?? Determine email to send notification to
      let notifyEmail = null;
      if (account?.adminUserId?.emailSyncEmail) {
        notifyEmail = account.adminUserId.emailSyncEmail;
      }

      const folderPath = path.join(
        BASE_UPLOAD_PATH,
        req.query.folderPath || ""
      );
      const folderMeta = readMeta(folderPath);
      folderMeta.files = folderMeta.files || [];

      // Parse selected invoices sent from frontend
      let selectedInvoices = [];
      if (req.body.invoices) {
        try {
          selectedInvoices = JSON.parse(req.body.invoices); // Array of invoice IDs
        } catch (err) {
          console.warn("Failed to parse invoices:", err);
        }
      }

      folderMeta.invoiceLock = selectedInvoices;

      // Save uploaded files and create InvoiceLock entries
      for (const file of req.files) {
        const fileMeta = {
          name: file.originalname,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          folder: req.query.folderPath || "",
          uploadedBy: "system",
          readOnly: false,
          readStatus: false,
          signStatus: "",
          authStatus: "",
          invoiceLock: selectedInvoices,
          lockInvoiceStatus:
            selectedInvoices.length > 0 ? "pendingpayment" : "",
        };

        // Push file metadata to folder
        folderMeta.files.push(fileMeta);
        writeMeta(folderPath, fileMeta, file.filename);

        // Insert invoice lock records
        for (const invoiceId of selectedInvoices) {
          const docPath = path.join(req.query.folderPath || "", file.filename);
          const lock = new InvoiceLock({
            invoiceId,
            documentPath: docPath,
            status: "pendingpayment",
          });
          await lock.save(); // save each lock in DB
        }
      }

      // Write folder meta
      writeMeta(folderPath, folderMeta);
      req.folderMeta = folderMeta;

      // 3?? Send email notification using Nodemailer
      if (notifyEmail) {
        //console.log("notifyEmail",notifyEmail)
        //  Configure transporter
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false, // Only for development
          },
          logger: true,
          debug: true,
        });
        //transporter.on('log', console.log)
        const uploadedFileNames = req.files
          .map((f) => f.originalname)
          .join(", ");

        // Prepare email
        const mailOptions = {
          from: `"SNP Taxes" <${process.env.SMTP_USER}>`,
          to: notifyEmail,
          subject: "#New Document Uploaded",
          text:
            `Hello ${account.adminUserId.username || "User"},\n\n` +
            `${req.files.length} file(s) have been uploaded ".\n\n` +
            `Please check your account for details.\n\nThank you.`,
          html: `<p>Hello ${account.adminUserId.username || "User"},</p>
              <p><strong>Account Name:</strong> ${account.accountName}</p>
        <p><strong>File Name:</strong> ${uploadedFileNames}</p>
                 <p>Thank you.</p>`,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Notification email sent to:", notifyEmail);
      }

      next();

      //return res.status(200).json({
      //  message: "mail send",

      // })
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Folder upload
const handleFolderUpload = [
  uploadMultiple.array("files"),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: "No files uploaded" });

      const folderPath = path.join(
        BASE_UPLOAD_PATH,
        req.query.folderPath || ""
      );
      const folderMeta = readMeta(folderPath);
      folderMeta.files = folderMeta.files || [];

      req.files.forEach((file) => {
        const fileMeta = {
          name: file.originalname,
          //storedName: file.filename,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          folder: req.query.folderPath || "",
          uploadedBy: "system",
          readOnly: false,
          readStatus: false,
          signStatus: "",
          authStatus: "",
        };
        folderMeta.files.push(fileMeta);
        writeMeta(folderPath, fileMeta, file.filename);
      });

      writeMeta(folderPath, folderMeta);

      res.status(201).json({
        message: "Folder uploaded successfully",
        files: req.files,
        folderMeta,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
// ============================
// ?? Folder Operations
// ============================
const createFolder = (req, res) => {
  try {
    const {
      name,
      parentPath = "",
      accountId,
      readOnly = false,
      invoiceId = null,
      readStatus = false,
      signStatus = "",
      authStatus = "",
    } = req.body;

    if (!name) return res.status(400).json({ error: "Folder name required" });

    if (!BASE_UPLOAD_PATH)
      return res.status(500).json({ error: "BASE_UPLOAD_PATH missing" });

    let parentFolder;

    // Creating under root (account folder)
    if (!parentPath) {
      if (!accountId)
        return res.status(400).json({ error: "accountId required" });

      parentFolder = path.join(BASE_UPLOAD_PATH, accountId);

      if (!fs.existsSync(parentFolder)) {
        fs.mkdirSync(parentFolder, { recursive: true });
      }
    } else {
      // Creating inside an existing folder
      parentFolder = path.join(BASE_UPLOAD_PATH, parentPath);

      if (!fs.existsSync(parentFolder)) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    const newFolderPath = path.join(parentFolder, name);

    if (fs.existsSync(newFolderPath))
      return res.status(400).json({ error: "Folder already exists" });

    fs.mkdirSync(newFolderPath, { recursive: true });

    const metaData = {
      name,
      path: path.relative(BASE_UPLOAD_PATH, newFolderPath),
      createdAt: new Date().toISOString(),
      readOnly,
      invoiceId,
      createdBy: "system",
      files: [],
      readStatus,
      signStatus,
      authStatus,
    };

    writeMeta(newFolderPath, metaData);

    res.status(201).json({ message: "Folder created", metaData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
const moveItem = async (req, res) => {
  try {
    const { sourcePath, destinationPath } = req.body;
    if (!sourcePath || !destinationPath)
      return res.status(400).json({ error: "Source and destination required" });

    const srcFull = path.join(BASE_UPLOAD_PATH, sourcePath);
    const destFull = path.join(BASE_UPLOAD_PATH, destinationPath);

    if (!fs.existsSync(srcFull))
      return res.status(404).json({ error: "Source not found" });
    if (!fs.existsSync(destFull))
      return res.status(404).json({ error: "Destination folder not found" });

    const itemName = path.basename(srcFull);
    const targetPath = path.join(destFull, itemName);

    if (fs.existsSync(targetPath))
      return res
        .status(400)
        .json({ error: "Item already exists at destination" });

    const isDirectory = fs.lstatSync(srcFull).isDirectory();

    // Try moving or copying+removing if across drives
    try {
      fs.renameSync(srcFull, targetPath);
    } catch (err) {
      if (err.code === "EXDEV" || err.code === "EPERM") {
        await fse.copy(srcFull, targetPath);
        await fse.remove(srcFull);
      } else {
        throw err;
      }
    }

    // ------------------------------
    // Recursive meta updater (for folders)
    // ------------------------------
    const updateMetaRecursive = (dir) => {
      const folderMeta = readMeta(dir);
      folderMeta.updatedAt = new Date().toISOString();
      folderMeta.path = path
        .relative(BASE_UPLOAD_PATH, dir)
        .replace(/\\/g, "/");
      folderMeta.name = path.basename(dir);
      writeMeta(dir, folderMeta);

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.lstatSync(fullPath).isDirectory()) {
          updateMetaRecursive(fullPath);
        } else {
          const fileMeta = readMeta(dir, entry);
          if (Object.keys(fileMeta).length) {
            fileMeta.path = path
              .relative(BASE_UPLOAD_PATH, fullPath)
              .replace(/\\/g, "/");
            fileMeta.updatedAt = new Date().toISOString();
            writeMeta(dir, fileMeta, entry);
          }
        }
      }
    };

    // ------------------------------
    // If folder: update all child metas
    // ------------------------------
    if (isDirectory) {
      updateMetaRecursive(targetPath);
    } else {
      // ------------------------------
      // If single file: move meta file too
      // ------------------------------
      const srcParent = path.dirname(srcFull);
      const destParent = path.dirname(targetPath);
      const fileName = path.basename(srcFull);
      const oldMetaPath = path.join(srcParent, `${fileName}.meta.json`);
      const newMetaPath = path.join(destParent, `${fileName}.meta.json`);

      if (fs.existsSync(oldMetaPath)) {
        try {
          // Move the meta file
          fs.renameSync(oldMetaPath, newMetaPath);
        } catch (err) {
          if (err.code === "EXDEV" || err.code === "EPERM") {
            await fse.copy(oldMetaPath, newMetaPath);
            await fse.remove(oldMetaPath);
          } else {
            throw err;
          }
        }

        // Update meta content
        const fileMeta = JSON.parse(fs.readFileSync(newMetaPath, "utf8"));
        fileMeta.path = path
          .relative(BASE_UPLOAD_PATH, targetPath)
          .replace(/\\/g, "/");
        fileMeta.updatedAt = new Date().toISOString();
        writeMeta(destParent, fileMeta, fileName);
      } else {
        // If no meta file existed � create one
        const stats = fs.statSync(targetPath);
        const newFileMeta = {
          name: fileName,
          path: path.relative(BASE_UPLOAD_PATH, targetPath).replace(/\\/g, "/"),
          size: stats.size,
          createdAt: stats.birthtime,
          updatedAt: new Date().toISOString(),
          readOnly: false,
          readStatus: false,
          signStatus: "",
          authStatus: "",
        };
        writeMeta(destParent, newFileMeta, fileName);
      }
    }

    res.status(200).json({
      message: `${isDirectory ? "Folder" : "File"} moved successfully`,
      newPath: path.relative(BASE_UPLOAD_PATH, targetPath).replace(/\\/g, "/"),
    });
  } catch (err) {
    console.error("Error moving item:", err);
    res.status(500).json({
      error: "Failed to move item",
      details: err.message,
    });
  }
};

module.exports = { moveItem };

const renameItem = async (req, res) => {
  try {
    const { currentPath, newName } = req.body;
    if (!currentPath || !newName)
      return res
        .status(400)
        .json({ error: "Current path and new name are required" });

    const srcFull = path.join(BASE_UPLOAD_PATH, currentPath);
    if (!fs.existsSync(srcFull))
      return res.status(404).json({ error: "Source not found" });

    const parentDir = path.dirname(srcFull);
    const destFull = path.join(parentDir, newName);
    if (fs.existsSync(destFull))
      return res
        .status(400)
        .json({ error: "A file/folder with new name exists" });

    const isDirectory = fs.lstatSync(srcFull).isDirectory();

    // Rename folder/file
    try {
      fs.renameSync(srcFull, destFull);
    } catch (err) {
      if (err.code === "EXDEV" || err.code === "EPERM") {
        await fse.copy(srcFull, destFull);
        await fse.remove(srcFull);
      } else {
        throw err;
      }
    }

    // ------------------------------
    // Recursive meta update function
    // ------------------------------
    const updateMetaRecursive = (dir) => {
      const folderMeta = readMeta(dir);
      Object.assign(folderMeta, { updatedAt: new Date().toISOString() });
      folderMeta.name = path.basename(dir);
      folderMeta.path = path
        .relative(BASE_UPLOAD_PATH, dir)
        .replace(/\\/g, "/");
      writeMeta(dir, folderMeta);

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.lstatSync(fullPath).isDirectory()) {
          updateMetaRecursive(fullPath);
        } else {
          const fileMeta = readMeta(dir, entry);
          if (Object.keys(fileMeta).length) {
            fileMeta.path = path
              .relative(BASE_UPLOAD_PATH, fullPath)
              .replace(/\\/g, "/");
            fileMeta.updatedAt = new Date().toISOString();
            writeMeta(dir, fileMeta, entry);
          }
        }
      }
    };

    if (isDirectory) {
      updateMetaRecursive(destFull);
    } else {
      // ? Single file: robust meta update
      const oldFileName = path.basename(currentPath);
      const newFileName = newName;

      let fileMeta = readMeta(parentDir, oldFileName);

      if (Object.keys(fileMeta).length === 0) {
        // fallback: maybe old meta is missing
        fileMeta = {};
      }

      // Preserve existing status fields and other meta
      fileMeta.name = newFileName;
      fileMeta.path = path
        .relative(BASE_UPLOAD_PATH, destFull)
        .replace(/\\/g, "/");
      fileMeta.updatedAt = new Date().toISOString();

      writeMeta(parentDir, fileMeta, newFileName);

      // Remove old meta file if exists
      const oldMetaPath = path.join(parentDir, `${oldFileName}.meta.json`);
      if (fs.existsSync(oldMetaPath)) fs.unlinkSync(oldMetaPath);
    }

    res.status(200).json({
      message: `${isDirectory ? "Folder" : "File"} renamed successfully`,
      newPath: path.relative(BASE_UPLOAD_PATH, destFull).replace(/\\/g, "/"),
    });
  } catch (err) {
    console.error("Error renaming item:", err);
    res
      .status(500)
      .json({ error: "Failed to rename item", details: err.message });
  }
};



const updateStatus = (req, res) => {
  try {
    const { targetPath, status } = req.body;

    if (!targetPath || !status)
      return res.status(400).json({ error: "targetPath and status required" });

    const fullPath = path.join(BASE_UPLOAD_PATH, targetPath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ error: "File or folder not found" });

    const isDirectory = fs.lstatSync(fullPath).isDirectory();

    const applyMetaUpdate = (meta) => {
      Object.assign(meta, status); // <--- add all fields from status
      meta.updatedAt = new Date().toISOString();
      return meta;
    };

    const updateMetaRecursive = (dir) => {
      let folderMeta = readMeta(dir);
      folderMeta = applyMetaUpdate(folderMeta);
      writeMeta(dir, folderMeta);

      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const entryPath = path.join(dir, entry);

        if (fs.lstatSync(entryPath).isDirectory()) {
          updateMetaRecursive(entryPath);
        } else {
          let fileMeta = readMeta(dir, entry);
          if (Object.keys(fileMeta).length) {
            fileMeta = applyMetaUpdate(fileMeta);
            writeMeta(dir, fileMeta, entry);
          }
        }
      }
    };

    if (isDirectory) {
      updateMetaRecursive(fullPath);
    } else {
      const parentDir = path.dirname(fullPath);
      const fileName = path.basename(fullPath);

      let fileMeta = readMeta(parentDir, fileName);
      if (Object.keys(fileMeta).length) {
        fileMeta = applyMetaUpdate(fileMeta);
        writeMeta(parentDir, fileMeta, fileName);
      }
    }

    res.json({
      message: `${isDirectory ? "Folder" : "File"} status updated successfully`,
      status,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = { updateStatus };

const setReadOnly = (req, res) => {
  try {
    const { folderPath, readOnly } = req.body;
    const fullPath = path.join(BASE_UPLOAD_PATH, folderPath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ error: "Folder not found" });

    const meta = readMeta(fullPath);
    meta.readOnly = readOnly;
    meta.updatedAt = new Date().toISOString();
    writeMeta(fullPath, meta);

    res.json({ message: `Folder ${readOnly ? "locked" : "unlocked"}`, meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ?? Set File Read-Only Status
 *
 */
const setFileReadOnly = (req, res) => {
  try {
    const { filePath, readOnly } = req.body;
    const fullPath = path.join(BASE_UPLOAD_PATH, filePath);
    const folderPath = path.dirname(fullPath);
    const fileName = path.basename(fullPath);

    if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
      return res.status(404).json({ error: "File not found" });
    }

    // ? Use your existing readMeta/writeMeta helpers with fileName argument
    const meta = readMeta(folderPath, fileName);
    meta.readOnly = readOnly;
    meta.updatedAt = new Date().toISOString();

    writeMeta(folderPath, meta, fileName);

    res.json({
      message: `File ${readOnly ? "locked" : "unlocked"}`,
      meta,
    });
  } catch (err) {
    console.error("Error in setFileReadOnly:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// DELETE FILE / FOLDER
const deleteItem = async (req, res) => {
  try {
    const { targetPath } = req.body;
    if (!targetPath)
      return res
        .status(400)
        .json({ success: false, message: "targetPath required" });

    const fullPath = path.join(BASE_UPLOAD_PATH, targetPath);

    if (!fs.existsSync(fullPath)) {
      return res
        .status(404)
        .json({ success: false, message: "File or folder not found" });
    }

    const stats = fs.statSync(fullPath);

    // ?? READ METADATA BEFORE DELETING FILE
    const metaFilePath = path.join(
      path.dirname(fullPath),
      `${path.basename(fullPath)}.meta.json`
    );

    let metaData = null;
    if (fs.existsSync(metaFilePath)) {
      metaData = JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
    }

    // ================
    // ?? DELETE FILE OR FOLDER
    // ================
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });

      // delete folder metadata
      const folderMetaFile = `${fullPath}.meta.json`;
      if (fs.existsSync(folderMetaFile)) fs.unlinkSync(folderMetaFile);

      removeFromParentMetadata(fullPath);

      // ?? ALSO DELETE RELATED DB RECORDS FOR EVERY SUBFILE
      if (metaData) {
        await deleteLinkedDBRecords(metaData);
      }

      return res.json({
        success: true,
        message: "Folder and metadata deleted successfully",
      });
    } else {
      fs.unlinkSync(fullPath);

      // delete file metadata
      if (fs.existsSync(metaFilePath)) fs.unlinkSync(metaFilePath);

      removeFromParentMetadata(fullPath);

      // ?? DELETE RELATED DB RECORDS
      if (metaData) {
        await deleteLinkedDBRecords(metaData);
      }

      return res.json({
        success: true,
        message: "File and metadata deleted successfully",
      });
    }
  } catch (err) {
    console.error("? Error in deleteItem:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
async function deleteLinkedDBRecords(meta) {
  try {
    // Delete e-sign request
    if (meta.esignRequestId) {
      await EsignRequests.findByIdAndDelete(meta.esignRequestId);
      console.log("??? Deleted Esign Request:", meta.esignRequestId);
    }

    // Delete approval request
    if (meta.approvalId) {
      await Approvals.findByIdAndDelete(meta.approvalId);
      console.log("??? Deleted Approval:", meta.approvalId);
    }

    // ?? Delete InvoiceLock using invoiceId stored in invoiceLock array
    if (meta.invoiceLock) {
      if (Array.isArray(meta.invoiceLock)) {
        for (const invoiceId of meta.invoiceLock) {
          const result = await InvoiceLock.deleteMany({ invoiceId });
          console.log(
            `??? Deleted InvoiceLock for invoiceId ${invoiceId}`,
            result
          );
        }
      } else {
        // If accidentally stored as single string
        await InvoiceLock.deleteMany({ invoiceId: meta.invoiceLock });
        console.log(
          `??? Deleted InvoiceLock for invoiceId ${meta.invoiceLock}`
        );
      }
    }
  } catch (err) {
    console.error("? Error deleting linked DB records:", err);
  }
}

// ========================
// ?? Helper: Remove from Parent Metadata
// ========================
function removeFromParentMetadata(fullPath) {
  try {
    const parentDir = path.dirname(fullPath);
    const parentMetaPath = path.join(parentDir, "folder.meta.json");

    if (fs.existsSync(parentMetaPath)) {
      const metaData = JSON.parse(fs.readFileSync(parentMetaPath, "utf8"));
      const baseName = path.basename(fullPath);

      // remove from "files" if it's there
      if (metaData.files && Array.isArray(metaData.files)) {
        const updatedFiles = metaData.files.filter((f) => f.name !== baseName);
        metaData.files = updatedFiles;
      }

      // remove from "folders" if you also track subfolders
      if (metaData.folders && Array.isArray(metaData.folders)) {
        const updatedFolders = metaData.folders.filter(
          (f) => f.name !== baseName
        );
        metaData.folders = updatedFolders;
      }

      fs.writeFileSync(
        parentMetaPath,
        JSON.stringify(metaData, null, 2),
        "utf8"
      );

      console.log(`? Removed ${baseName} from parent folder metadata`);
    }
  } catch (err) {
    console.error("?? Error updating parent metadata:", err);
  }
}

// ============================
// ?? List Folder Contents
// ============================
const listFolderContent = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath))
      return res.status(404).json({ error: "Folder not found" });

    const entries = fs.readdirSync(folderPath);
    const items = entries
      .filter((f) => !f.endsWith(".meta.json"))
      .map((name) => {
        const fullPath = path.join(folderPath, name);
        const isDir = fs.statSync(fullPath).isDirectory();
        const meta = readMeta(fullPath);
        return {
          name,
          type: isDir ? "folder" : "file",
          path: path.relative(BASE_UPLOAD_PATH, fullPath),
          ...meta,
        };
      });

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// ?? Metadata Operations
// ============================
const getMeta = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath))
      return res.status(404).json({ error: "Folder not found" });
    const meta = readMeta(folderPath, req.query.fileName);
    res.json({ meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateMeta = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.body.folderPath || "");
    if (!fs.existsSync(folderPath))
      return res.status(404).json({ error: "Folder not found" });

    const meta = readMeta(folderPath, req.body.fileName);
    Object.assign(meta, req.body.data);
    meta.updatedAt = new Date().toISOString();
    writeMeta(folderPath, meta, req.body.fileName);

    res.json({ message: "Metadata updated", meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ============================
// ?? Recursive Folder Listing (Clean)
// ============================
const listFoldersAndFiles = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Recursive function
    const readRecursive = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      let folders = 0;
      let files = 0;

      const contents = entries
        .filter(
          (entry) => !entry.name.endsWith(".meta.json") // hide meta files
        )
        .map((entry) => {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path
            .relative(BASE_UPLOAD_PATH, fullPath)
            .replace(/\\/g, "/"); // clean path for Windows

          if (entry.isDirectory()) {
            folders++;
            return {
              name: entry.name,
              type: "folder",
              path: relativePath,
              meta: readMeta(fullPath),
              children: readRecursive(fullPath),
            };
          } else {
            files++;
            return {
              name: entry.name,
              type: "file",
              path: relativePath,
              meta: readMeta(path.dirname(fullPath), entry.name),
            };
          }
        });

      return contents;
    };

    const structure = readRecursive(folderPath);

    res.json({
      folder: req.query.folderPath || "/",
      contents: structure,
    });
  } catch (err) {
    console.error("Error reading folders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const clientListFoldersAndFiles = (req, res) => {
  try {
    const folderPath = path.join(BASE_UPLOAD_PATH, req.query.folderPath || "");
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // ?? Recursive function to read folders and files
    const readRecursive = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      const contents = entries
        .filter(
          (entry) =>
            !entry.name.endsWith(".meta.json") && entry.name !== "Private" // ?? skip private folder
        )
        .map((entry) => {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path
            .relative(BASE_UPLOAD_PATH, fullPath)
            .replace(/\\/g, "/");

          if (entry.isDirectory()) {
            return {
              name: entry.name,
              type: "folder",
              path: relativePath,
              meta: readMeta(fullPath),
              // ?? stop recursion if current folder is "private"
              children: entry.name === "Private" ? [] : readRecursive(fullPath),
            };
          } else {
            return {
              name: entry.name,
              type: "file",
              path: relativePath,
              meta: readMeta(path.dirname(fullPath), entry.name),
            };
          }
        });

      return contents;
    };

    const structure = readRecursive(folderPath);

    res.json({
      message: "data retrive successfully",
      folder: req.query.folderPath || "/",
      contents: structure,
    });
  } catch (err) {
    console.error("Error reading folders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const lockUnlockInvoice = async (req, res) => {
  try {
    const { filePath, invoiceIds, action } = req.body;
    // action = "lock" OR "unlock"
    console.log("request body", req.body);
    if (!filePath || !action)
      return res.status(400).json({ error: "filePath & action are required" });

    const fullPath = path.join(BASE_UPLOAD_PATH, filePath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ error: "File not found" });

    const parentDir = path.dirname(fullPath);
    const fileName = path.basename(fullPath);

    let fileMeta = readMeta(parentDir, fileName);
    if (!fileMeta || Object.keys(fileMeta).length === 0)
      return res.status(400).json({ error: "Metadata not found" });

    /** =====================  UNLOCK INVOICE  ===================== **/
    if (action === "unlock") {
      if (!invoiceIds || !Array.isArray(invoiceIds))
        return res
          .status(400)
          .json({ error: "invoiceIds array required for unlock" });

      fileMeta.invoiceLock = [];
      fileMeta.lockInvoiceStatus = "";
      fileMeta.updatedAt = new Date().toISOString();

      writeMeta(parentDir, fileMeta, fileName);

      // Delete invoice lock records using invoiceIds
      await InvoiceLock.deleteMany({
        invoiceId: { $in: invoiceIds },
        documentPath: filePath,
      });

      return res.json({ message: "Invoice unlocked successfully", fileMeta });
    }

    /** =====================  LOCK INVOICE  ===================== **/
    if (action === "lock") {
      if (!invoiceIds || !Array.isArray(invoiceIds))
        return res
          .status(400)
          .json({ error: "invoiceIds array required for lock" });

      fileMeta.invoiceLock = invoiceIds;
      fileMeta.lockInvoiceStatus = "pendingpayment";
      fileMeta.updatedAt = new Date().toISOString();

      writeMeta(parentDir, fileMeta, fileName);

      // Create DB invoice lock entries
      for (const invoiceId of invoiceIds) {
        const exist = await InvoiceLock.findOne({
          invoiceId,
          documentPath: filePath,
        });
        if (!exist) {
          await InvoiceLock.create({
            invoiceId,
            documentPath: filePath,
            status: "pendingpayment",
          });
        }
      }

      return res.json({ message: "Invoice locked successfully", fileMeta });
    }

    return res
      .status(400)
      .json({ error: "Invalid action (use 'lock' or 'unlock')" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const sendApprovalEmail = require("../utils/sendApprovalEmail");

const toggleApprovalStatus = async (req, res) => {
  try {
    const {
      filePath,
      action,
      accountId,
      fileUrl,
      filename,
      clientEmail,
      approvalId,
      declineReason,
      description,
    } = req.body;

    if (!filePath || !action)
      return res.status(400).json({ error: "filePath & action are required" });

    const fullPath = path.join(BASE_UPLOAD_PATH, filePath);
    if (!fs.existsSync(fullPath))
      return res.status(404).json({ error: "File not found" });

    const parentDir = path.dirname(fullPath);
    const fileName = path.basename(fullPath);
    let fileMeta = readMeta(parentDir, fileName);
    if (!fileMeta)
      return res.status(400).json({ error: "File metadata not found" });

    /* ========== SEND ========== */
    if (action === "send") {
      if (!accountId || !fileUrl || !filename || !clientEmail)
        return res.status(400).json({ error: "required fields missing" });
      console.log(`?? Sending approval for ${filename} to ${clientEmail}`);
      const newApproval = await Approvals.create({
        accountId,
        filename,
        fileUrl,
        clientEmail,
        status: "pending",
        description: description,
      });
      console.log("newapproval", newApproval);
      fileMeta.authStatus = "pendingApproval";
      fileMeta.approvalId = newApproval._id;
      fileMeta.updatedAt = new Date().toISOString();
      writeMeta(parentDir, fileMeta, fileName);

      // 4. IMMEDIATE SUCCESS RESPONSE
      return res.json({
        message: "Approval sent successfully & email queued",
        fileMeta,
        approvalId: newApproval._id,
      });
    }
    /* ========== CANCEL (Manual Cancel) ========== */
    if (action === "cancel") {
      if (!approvalId)
        return res.status(400).json({ error: "approvalId required" });

      await Approvals.findByIdAndUpdate(approvalId, { status: "cancelled" });

      fileMeta.authStatus = "";
      fileMeta.approvalId = null;
      fileMeta.cancelReason = null;
      fileMeta.updatedAt = new Date().toISOString();
      writeMeta(parentDir, fileMeta, fileName);

      return res.json({ message: "Approval cancelled", fileMeta });
    }

    /* ========== APPROVE ========== */
    if (action === "approve") {
      if (!approvalId)
        return res.status(400).json({ error: "approvalId required" });

      await Approvals.findByIdAndUpdate(approvalId, { status: "approved" });

      fileMeta.authStatus = "approvalCompleted";
      fileMeta.updatedAt = new Date().toISOString();
      writeMeta(parentDir, fileMeta, fileName);

      return res.json({ message: "Approved successfully", fileMeta });
    }

    /* ========== DECLINE (New Feature) ========== */
    if (action === "decline") {
      if (!approvalId)
        return res.status(400).json({ error: "approvalId required" });
      if (!declineReason)
        return res.status(400).json({ error: "declineReason required" });

      await Approvals.findByIdAndUpdate(approvalId, {
        status: "cancelled",
        description: declineReason, // save reason in DB
      });

      fileMeta.authStatus = "declinedApproval";
      fileMeta.cancelReason = declineReason; // store reason in metadata
      fileMeta.updatedAt = new Date().toISOString();
      writeMeta(parentDir, fileMeta, fileName);

      return res.json({
        message: "Approval declined & reason saved",
        fileMeta,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createFolderMetaIfNotExists = async (folderPath, relativePath) => {
  const folderName = path.basename(folderPath);
  const metaPath = path.join(folderPath, `${folderName}.meta.json`);

  if (await fs.pathExists(metaPath)) return;

  const meta = {
    type: "folder",
    name: folderName,
    relativePath,
    createdAt: new Date().toISOString(),
  };

  await fs.writeJson(metaPath, meta, { spaces: 2 });
};

const createFileMeta = async (filePath, file, relativePath) => {
  const metaPath = `${filePath}.meta.json`;

  const meta = {
    type: "file",
    name: file.originalname,
    relativePath,
    size: file.size,
    extension: path.extname(file.originalname),
    uploadedAt: new Date().toISOString(),
  };

  await fs.writeJson(metaPath, meta, { spaces: 2 });
};

// const uploadFolderRaw = async (req, res) => {
//   try {
//     const { accountId } = req.body;
//     const files = req.files;

//     const paths = Array.isArray(req.body.paths)
//       ? req.body.paths
//       : [req.body.paths];

//     if (!accountId || !files?.length) {
//       return res.status(400).json({ error: "Invalid request" });
//     }

//     const basePath = path.join(
//       __dirname,
//       "../uploads/accounts",
//       accountId
//     );

//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const relativePath = paths[i]; // GST/gst.pdf

//       const destPath = path.join(basePath, relativePath);
//       const folderPath = path.dirname(destPath);
//       const folderRelativePath = path.dirname(relativePath);

//       // 1️⃣ Ensure folder exists
//       await fs.ensureDir(folderPath);

//       // 2️⃣ Create folder metadata (ONCE)
//       await createFolderMetaIfNotExists(
//         folderPath,
//         folderRelativePath
//       );

//       // 3️⃣ Write file
//       await fs.writeFile(destPath, file.buffer);

//       // 4️⃣ Create file metadata
//       await createFileMeta(destPath, file, relativePath);
//     }

//     return res.json({
//       success: true,
//       message: "Files & metadata created successfully",
//     });
//   } catch (err) {
//     console.error("UPLOAD ERROR:", err);
//     return res.status(500).json({ error: "Upload failed" });
//   }
// };

const uploadFolderRaw = async (req, res) => {
  try {
    const { accountId } = req.body;
    const files = req.files;
    const paths = Array.isArray(req.body.paths)
      ? req.body.paths
      : [req.body.paths];

    const basePath = path.join(__dirname, "../uploads/accounts", accountId);

    for (let i = 0; i < files.length; i++) {
      const relativePath = paths[i]; // clean path from frontend
      const destPath = path.join(basePath, relativePath);

      // ✅ Ensure folder exists
      await fs.ensureDir(path.dirname(destPath));

      // ✅ Write file
      await fs.writeFile(destPath, files[i].buffer);

      // ✅ Create file meta
      const fileMeta = {
        name: files[i].originalname,
        size: files[i].size,
        type: files[i].mimetype,
        uploadedAt: new Date().toISOString(),
      };
      const fileMetaPath = destPath + ".meta.json"; // filename.meta.json
      await fs.writeJSON(fileMetaPath, fileMeta, { spaces: 2 });

      // ✅ Create folder meta for each folder in path
      const parts = relativePath.split("/");
      let currentPath = basePath;
      for (let j = 0; j < parts.length - 1; j++) {
        currentPath = path.join(currentPath, parts[j]);
        const folderMetaPath = path.join(
          currentPath,
          parts[j] + ".meta.json" // foldername.meta.json
        );

        if (!(await fs.pathExists(folderMetaPath))) {
          const folderMeta = {
            name: parts[j],
            type: "folder",
            createdAt: new Date().toISOString(),
          };
          await fs.writeJSON(folderMetaPath, folderMeta, { spaces: 2 });
        }
      }
    }

    res.json({ success: true, message: "Files and meta uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};
// ============================
// ?? Exports
// ============================
module.exports = {
  BASE_UPLOAD_PATH,
  ensureDir,
  getMetaPath,
  readMeta,
  writeMeta,
  handleFileUpload,
  uploadFile: [
    handleFileUpload,
    (req, res) =>
      res.status(201).json({
        message: "File uploaded successfully",
        file: req.file,
        folderMeta: req.folderMeta,
        fileMeta: req.fileMeta,
      }),
  ],
  handleFolderUpload,
  createFolder,
  setReadOnly,
  getMeta,
  updateMeta,
  listFolderContent, // ?? new function added here
  listFoldersAndFiles, // ?? add this line
  deleteItem,
  setFileReadOnly,
  moveItem,
  renameItem,
  updateStatus,
  clientListFoldersAndFiles,
  loadMetadata,
  saveMetadata,
  lockUnlockInvoice,
  toggleApprovalStatus,
  uploadFolderZipFplder,mergeUnzippedFolderToTarget,
  uploadFolder,uploadFolderRaw
};

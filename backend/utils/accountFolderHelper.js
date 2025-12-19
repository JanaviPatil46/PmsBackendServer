const fs = require("fs");
const path = require("path");

const ACCOUNTS_BASE_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "folder-management",
  "uploads",
  "accounts"
);

/* ---------------- HELPERS ---------------- */

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeMeta(metaPath, data) {
  try {
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
    console.log("✅ Meta created:", metaPath);
  } catch (err) {
    console.error("❌ Meta write failed:", metaPath, err);
  }
}

/* ---------------- ROOT ---------------- */

function createAccountsRootMeta() {
  ensureDir(ACCOUNTS_BASE_PATH);

  // accounts/accounts.metadata.json
  writeMeta(path.join(ACCOUNTS_BASE_PATH, "accounts.metadata.json"), {
    name: "accounts",
    path: "uploads/accounts",
    type: "root",
    createdAt: new Date().toISOString(),
    createdBy: "system",
    files: [],
    folders: [],
  });
}

/* ---------------- ACCOUNT FOLDERS ---------------- */

function createAccountFolders(accountId, createdBy = "system") {
  const accountFolder = path.join(ACCOUNTS_BASE_PATH, accountId);
  ensureDir(accountFolder);

  const subfolders = [ 
   
  ];
// "Client Uploaded Documents", "Firm Documents Shared with Client", "Private"
  // ACC001/ACC001.metadata.json
  writeMeta(path.join(accountFolder, `${accountId}.meta.json`), {
    name: accountId,
    path: `uploads/accounts/${accountId}`,
    type: "account",
    createdAt: new Date().toISOString(),
    createdBy,
    files: [],
    folders: subfolders,
  });

  // Subfolders
  subfolders.forEach((sub) => {
    const subPath = path.join(accountFolder, sub);
    ensureDir(subPath);

    // Client Uploaded Documents.metadata.json
    writeMeta(path.join(subPath, `${sub}.meta.json`), {
      name: sub,
      path: `uploads/accounts/${accountId}/${sub}`,
      type: "folder",
      createdAt: new Date().toISOString(),
      createdBy,
      parent: accountId,
      files: [],
      folders: [],
    });
  });
}

/* ---------------- FILE UPLOAD META ---------------- */

function createFileMeta({
  accountId,
  folderPath,
  fileName,
  size,
  mimeType,
  createdBy,
}) {
  const filePath = path.join(folderPath, fileName);

  // invoice.pdf.metadata.json
  const metaPath = path.join(
    folderPath,
    `${fileName}.meta.json`
  );

  writeMeta(metaPath, {
    name: fileName,
    path: path
      .relative(
        path.resolve(__dirname, "..", "..", "folder-management"),
        filePath
      )
      .replace(/\\/g, "/"),
    type: "file",
    size,
    mimeType,
    uploadedAt: new Date().toISOString(),
    uploadedBy: createdBy,
    accountId,
  });
}

/* ---------------- EXPORTS ---------------- */

module.exports = {
  createAccountsRootMeta,
  createAccountFolders,
  createFileMeta,
};

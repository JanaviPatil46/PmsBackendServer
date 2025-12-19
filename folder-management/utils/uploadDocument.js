const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

const UPLOADS_BASE = path.resolve(
  __dirname,
  "../uploads/accounts"
);

const ACCOUNTS_BASE = path.join(UPLOADS_BASE, "accounts");

/* -------- helpers -------- */

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeMetadata(metaPath, data) {
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
}

/* -------- main function -------- */

exports.uploadFolderToAccount = async (req, res) => {
  try {
    const { sourceFolderPath, accountId } = req.body;

    if (!sourceFolderPath || !accountId) {
      return res.status(400).json({
        success: false,
        message: "sourceFolderPath and accountId are required",
      });
    }

    const resolvedSourcePath = path.resolve(UPLOADS_BASE, sourceFolderPath);
    const accountPrivatePath = path.join(
      ACCOUNTS_BASE,
      accountId,
      "Private"
    );

    if (!fs.existsSync(resolvedSourcePath)) {
      return res.status(404).json({
        success: false,
        message: "Source folder not found",
      });
    }

    ensureDir(accountPrivatePath);

    const items = fs.readdirSync(resolvedSourcePath);

    /* ---------- COPY CONTENT ---------- */
    for (const item of items) {
      const src = path.join(resolvedSourcePath, item);
      const dest = path.join(accountPrivatePath, item);
      await fse.copy(src, dest, { overwrite: true });
    }

    /* ---------- METADATA CREATION ---------- */
    const updateMetaRecursive = (currentPath) => {
      const entries = fs.readdirSync(currentPath);

      entries.forEach((entry) => {
        if (entry.endsWith(".metadata.json")) return;

        const fullPath = path.join(currentPath, entry);
        const stat = fs.statSync(fullPath);

        const metaPath = path.join(
          path.dirname(fullPath),
          `${entry}.metadata.json`
        );

        if (stat.isDirectory()) {
          writeMetadata(metaPath, {
            name: entry,
            path: path
              .relative(UPLOADS_BASE, fullPath)
              .replace(/\\/g, "/"),
            type: "folder",
            appliedToAccount: accountId,
            updatedAt: new Date().toISOString(),
            files: [],
            folders: [],
          });

          updateMetaRecursive(fullPath);
        } else {
          writeMetadata(metaPath, {
            name: entry,
            path: path
              .relative(UPLOADS_BASE, fullPath)
              .replace(/\\/g, "/"),
            type: "file",
            size: stat.size,
            updatedAt: new Date().toISOString(),
            uploadedToAccount: accountId,
          });
        }
      });
    };

    updateMetaRecursive(accountPrivatePath);

    res.status(200).json({
      success: true,
      message: "Folder uploaded to account private successfully",
      accountId,
      copiedFrom: sourceFolderPath,
      copiedTo: `accounts/${accountId}/Private`,
    });
  } catch (error) {
    console.error("Upload folder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload folder",
      error: error.message,
    });
  }
};

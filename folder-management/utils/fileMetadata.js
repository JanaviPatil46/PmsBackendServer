const fs = require("fs");
const path = require("path");

// Make sure this matches your actual uploads root folder
//const BASE_UPLOAD_PATH = path.join(__dirname, "..", "uploads");
const BASE_UPLOAD_PATH = path.join(__dirname, "../uploads/accounts");

// Loads metadata for a given documentPath
function getMetaPath(documentPath) {
  return path.join(BASE_UPLOAD_PATH, documentPath + ".meta.json");
}

function loadMetadata(documentPath) {
  const metaPath = getMetaPath(documentPath);

  if (!fs.existsSync(metaPath)) return null;

  const data = fs.readFileSync(metaPath, "utf8");
  return {
    meta: JSON.parse(data),
    metaPath,
  };
}

function saveMetadata(metaPath, metaData) {
  fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2), "utf8");
}

module.exports = {
  loadMetadata,
  saveMetadata,
};

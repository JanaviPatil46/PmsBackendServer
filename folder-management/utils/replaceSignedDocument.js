const fs = require("fs");
const path = require("path");
const axios = require("axios");
const EsignRequest = require("../models/EsignRequest"); // adjust path if needed

async function replaceSignedDocument(externalId, signedFileUrl) {
  try {
    const record = await EsignRequest.findOne({ externalId });
    if (!record) throw new Error("Esign record not found");

    const oldFilePath = record.fileUrl.replace(
      "https://www.snptaxes.com",
      "/var/www/snp_backend_03/folder-management"
    );

    const saveDir = path.dirname(oldFilePath);
    const ext = path.extname(oldFilePath) || ".pdf";
    const newFilePath = oldFilePath.replace(ext, `_signed${ext}`);

    // Ensure folder exists
    fs.mkdirSync(saveDir, { recursive: true });

    // Download new signed file
    const response = await axios.get(signedFileUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(newFilePath, response.data);

    // Update DB fileUrl
    const newUrl = record.fileUrl.replace(ext, `_signed${ext}`);
    record.fileUrl = newUrl;
    await record.save();

    return { success: true, newUrl };
  } catch (err) {
    console.error("Error replacing signed document:", err);
    return { success: false, error: err.message };
  }
}

module.exports = { replaceSignedDocument };

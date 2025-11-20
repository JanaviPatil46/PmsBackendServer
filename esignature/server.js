const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const app = express();
//app.use(cors());
app.use(express.json());
const mongoose = require("mongoose");
const docuseal = require('@docuseal/api');
const API_KEY = process.env.DOCUSEAL_API_KEY;
const axios = require('axios');
const transporter = require("./nodemaile.js");
const dbconnect = require('./mogodb/db');
const EsignRequest = require("./models/EsignRequest");
const { fetchSignedDocuments, savePdfFromUrl } = require("./utils/docuseal.js");
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001','http://localhost:3000','https://snptaxes.com'], // allow both
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

docuseal.configure({
  key: process.env.DOCUSEAL_API_KEY, // best practice: use .env
  url: "https://api.docuseal.com"
});


// database connect
dbconnect()
//app.get('/api/generate-token', async (req, res) => {
 // try {

   //   const { url, name,accountId  } = req.query;
//console.log("query",req.query)
   // if (!url) return res.status(400).json({ error: 'Missing file URL' });
 // const externalId = 'template-' + Date.now();    const token = jwt.sign(
     // {
     //  user_email: 'tax+test@snptaxandfinancials.com', // who is signing
      //  integration_email: 'taxteam@snptaxandfinancials.com',
        // name: name || 'Doc',
       // document_urls: [url],
     //  external_id: externalId,
              
    
     // },
     // API_KEY,
     // { expiresIn: '1h' }
    //);

  //res.json({ token });
 // ? Save in DB
  //  await EsignRequest.create({
   //   filename: name,
   //   fileUrl: url,
    //  accountId: accountId,
     // status: "pending",
     // submissionId: null,
    //  externalId: externalId
   // });

  //  res.json({ token, externalId });
 // } catch (err) {
   // res.status(500).json({ error: 'Failed to generate token' });
 // }
//});

app.get('/api/generate-token', async (req, res) => {
  try {
    const { url, name, accountId } = req.query;
    console.log("query", req.query);

    if (!url) return res.status(400).json({ error: 'Missing file URL' });
    if (!API_KEY) throw new Error('Missing API_KEY');

    const encodedUrl = encodeURI(url); 
    const externalId = 'template-' + Date.now();

    const token = jwt.sign({
      user_email: 'tax+test@snptaxandfinancials.com',
      integration_email: 'taxteam@snptaxandfinancials.com',
      name: name || 'Doc',
      document_urls: [encodedUrl],
      external_id: externalId
    }, API_KEY, { expiresIn: '1h' });

    await EsignRequest.create({
      filename: name,
      fileUrl: encodedUrl,
      accountId,
      status: "pending",
      submissionId: null,
      externalId
    });

    res.json({ token, externalId });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: err.message });
  }
});



app.get("/api/get-submission-file", async (req, res) => {
  const { submissionId } = req.query;

  if (!submissionId) return res.status(400).json({ error: "Missing submission ID" });

  try {
    const response = await axios.get(`https://api.docuseal.com/v1/submissions/${submissionId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const downloadUrl = response.data?.download_url;

    if (downloadUrl) {
      res.json({ downloadUrl });
    } else {
      res.status(404).json({ error: "Download URL not found" });
    }
  } catch (err) {
    console.error("DocuSeal fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});
app.use("/esignuploads", express.static(path.join(__dirname, "uploads")));

app.get('/api/submissions', async (req, res) => {
  try {
    const { data, pagination } = await docuseal.listSubmissions({ limit: 10 });
    res.json({ submissions: data, pagination });
    // console.log("submission",data )
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions', details: err.message });
  }
});

app.post("/notify-admin", async (req, res) => {
  const { clientName, documentName } = req.body;

  const mailOptions = {
    from: `"Signature Alert" <${process.env.EMAIL}>`,
    to: process.env.ADMIN_EMAIL, // Admin email
    subject: "#Document Signed Notification",
    text: `Document "${documentName}" was successfully signed by "${clientName}".`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Notification email sent to admin." });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({ error: "Failed to send notification email." });
  }
});

app.get("/signautrelist/:accountId", async (req, res) => {
  try {
    const { accountId} = req.params;
console.log("accountid",accountId)

    const requests = await EsignRequest.find({
      accountId
      
    }).sort({ createdAt: -1 }); // latest first

    res.json(requests);
  } catch (error) {
    console.error("Error fetching e-sign list:", error);
    res.status(500).json({ error: "Server error while fetching e-sign list" });
  }
});
// GET e-sign list by externalId
// GET /esign/list/:externalId
app.get("/signautrelist/list/:externalId", async (req, res) => {
  try {
    const { externalId } = req.params;

    const esignList = await EsignRequest.find({ externalId });

    res.json(esignList);
  } catch (err) {
    console.error("Error fetching e-sign list by externalId:", err);
    res.status(500).json({ error: "Failed to fetch e-sign list" });
  }
});

// PATCH /esign/update/:externalId
//app.patch("/signautrelist/update/:externalId", async (req, res) => {
 // try {
 //   const { externalId } = req.params;
  //  const updateData = req.body; // Fields to update

  //  const updatedEsign = await EsignRequest.findOneAndUpdate(
  //    { externalId },        // filter by externalId
  //    { $set: updateData },  // update fields
  //    { new: true }          // return updated document
  //  );

  //  if (!updatedEsign) {
   //   return res.status(404).json({ error: "No record found for this externalId" });
   // }
  //  res.json(updatedEsign);
  //} catch (err) {
  //  console.error("Error updating e-sign by externalId:", err);
   // res.status(500).json({ error: "Failed to update e-sign" });
 // }
//});
app.patch("/signautrelist/update/:externalId", async (req, res) => {
  try {
    const { externalId } = req.params;
    const { submissionId } = req.body;

    let updatedEsign = await EsignRequest.findOneAndUpdate(
      { externalId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedEsign) {
      return res.status(404).json({ error: "No record found" });
    }

    // Skip if no submissionId provided
    if (!submissionId) return res.json(updatedEsign);

    // 1?? Get DocuSeal signed PDF URLs
    const documents = await fetchSignedDocuments(submissionId);
    if (!documents?.length) return res.json(updatedEsign);

    const signedUrl = documents[0].url;

    // 2?? Extract parent folder & original file name
    const relativePath = decodeURIComponent(
      updatedEsign.fileUrl.split("/uploads/accounts/")[1]
    );

    const parts = relativePath.split("/");
    const originalFileName = parts.pop(); // file.pdf
    const parentFolder = parts.join("/"); // accounts/client123/2024/tax-docs

    // 3?? Folder-management backend base path
    const TARGET_BASE_PATH = "/var/www/snp_backend_03/folder-management/uploads/accounts";
    const absoluteFolderPath = path.join(TARGET_BASE_PATH, parentFolder);

    // Ensure folder exists
    if (!fs.existsSync(absoluteFolderPath)) {
      fs.mkdirSync(absoluteFolderPath, { recursive: true });
    }

    // 4?? Save signed file using same original name (replaces old file)
    const absoluteSavePath = path.join(absoluteFolderPath, originalFileName);
    await savePdfFromUrl(signedUrl, absoluteSavePath);

    console.log("Signed document replaced:", absoluteSavePath);

    // 5?? Ensure DB still points to the SAME path
    updatedEsign.signedFileUrl = updatedEsign.fileUrl; // same file
    await updatedEsign.save();

    res.json(updatedEsign);

  } catch (err) {
    console.error("Error updating e-sign:", err);
    res.status(500).json({ error: "Failed to update e-sign" });
  }
});
app.post("/replace-signed", async (req, res) => {
  const { externalId, signedFileUrl } = req.body;
  const result = await replaceSignedDocument(externalId, signedFileUrl);
  res.json(result);
});
app.post("/docuseal/download", async (req, res) => {
  try {
    const { submissionId, externalId } = req.body;
    if (!submissionId) return res.status(400).json({ error: "Missing submissionId" });

    // 1. Get signed documents list
    const apiRes = await fetch(`https://api.docuseal.com/submissions/${submissionId}/documents`, {
      method: "GET",
      headers: { "X-Auth-Token": process.env.DOCUSEAL_API_KEY }
    });
    const data = await apiRes.json();

    if (!data?.documents?.length) {
      return res.status(404).json({ error: "No signed documents found" });
    }

    const fileUrl = data.documents[0].url;
    const fileName = data.documents[0].filename || `signed-${submissionId}.pdf`;

    // 2. Download the PDF
    const fileRes = await fetch(fileUrl);
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    // 3. Save locally (adjust for your server path)
    const savePath = `/var/www/mywebsite/build/uploads/signed/${fileName}`;
    await fs.promises.writeFile(savePath, buffer);

    // 4. Update database optional
    await EsignRequest.findOneAndUpdate(
      { externalId },
      { submissionId, signedFileUrl: `/uploads/signed/${fileName}`, status: "signed" }
    );

    res.json({
      success: true,
      signedFileUrl: `https://snptaxes.com/uploads/signed/${fileName}`
    });

  } catch (err) {
    console.error("Download Signed File Error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/save-signed-file", async (req, res) => {
  try {
    const { originalFileUrl, signedUrl } = req.body;

    if (!originalFileUrl || !signedUrl) {
      return res.status(400).json({ error: "Missing originalFileUrl or signedUrl" });
    }

    // Extract everything after "/uploads/"
    const relativePath = originalFileUrl.split("/uploads/")[1]; 
    if (!relativePath) {
      return res.status(400).json({ error: "Invalid originalFileUrl format" });
    }

    // Convert to local filesystem path
    const localPath = path.join(
      "/var/www/snp_backend_03/folder-management/uploads",
      relativePath
    );

    console.log("Saving signed file to:", localPath);

    // Download signed PDF
    const fileResponse = await fetch(signedUrl);
    if (!fileResponse.ok) throw new Error("Failed to download signed file");
    const buffer = Buffer.from(await fileResponse.arrayBuffer());

    // Ensure folder exists
    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    // Overwrite old file
    fs.writeFileSync(localPath, buffer);

    res.json({
      success: true,
      message: "Signed document saved & replaced successfully",
      savedPath: localPath
    });
  } catch (error) {
    console.error("Error saving signed document:", error);
    res.status(500).json({ error: error.message });
  }
});
app.use("/signeddoc", express.static("uploads"));

const PORT = process.env.PORT || 8016;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");

// const app = express();
// app.use(cors());
// app.use(express.json());
// const path = require("path");
// const PORT = 8016;

// app.get("/api/generate-token", (req, res) => {
//    const timestamp = Date.now();
//   const payload = {
//     user_email: "tax@snptaxandfinancials.com",
//     integration_email: "tax@snptaxandfinancials.com",
//     external_id: `TestForm-${timestamp}`,
//     name: "Integration W-9 Test Form",
//     document_urls: [ "http://127.0.0.1:5000/uploads/2023%20Revised%20E-file%20Authorization%20(GUNDA%20VEERA%20VENKATA%20H).pdf"],
//   };

//   const token = jwt.sign(
//     payload,
//     "5PCRaTkcDsooLeXLx1WfXbXtPscwgYNarGuJSauXkg2",
//     {
//       algorithm: "HS256",
//     }
//   );

//   res.json({ token });
// });

// app.use("/esignuploads", express.static(path.join(__dirname, "uploads")));

// app.listen(PORT, () => {
//   console.log(`✅ Backend running at http://localhost:${PORT}`);
// });

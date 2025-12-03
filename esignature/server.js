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

    //await EsignRequest.create({
  const savedRequest = await EsignRequest.create({
     filename: name,
      fileUrl: encodedUrl,
      accountId,
      status: "pending",
      submissionId: null,
      externalId
   });

   res.json({ token, externalId,esignRequestId: savedRequest._id  });
 

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
app.get("/signature/byid/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching signature by ID:", id);

    const record = await EsignRequest.findById(id);

    if (!record) {
      return res.status(404).json({ error: "Signature record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error("Error fetching signature by ID:", error);
    res.status(500).json({ error: "Server error while fetching signature" });
  }
});

app.get("/signautrelist/:accountId", async (req, res) => {
  try {
    const { accountId} = req.params;
console.log("accountid",accountId)

    const requests = await EsignRequest.find({
      accountId,  status: { $in: ["pending", "in_progress"] },      
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
  //try {
   // const { externalId } = req.params;
   // const { submissionId } = req.body;

   // let updatedEsign = await EsignRequest.findOneAndUpdate(
   //   { externalId },
   //  { $set: req.body },
   // { new: true }
  //  );

  //  if (!updatedEsign) {
   //   return res.status(404).json({ error: "No record found" });
   // }

    // Skip if no submissionId provided
   // if (!submissionId) return res.json(updatedEsign);

    // 1?? Get DocuSeal signed PDF URLs
   // const documents = await fetchSignedDocuments(submissionId);
  //  if (!documents?.length) return res.json(updatedEsign);

  //  const signedUrl = documents[0].url;

    // 2?? Extract parent folder & original file name
  //  const relativePath = decodeURIComponent(
   //   updatedEsign.fileUrl.split("/uploads/accounts/")[1]
 //  );

   // const parts = relativePath.split("/");
  //  const originalFileName = parts.pop(); // file.pdf
   // const parentFolder = parts.join("/"); // accounts/client123/2024/tax-docs

    // 3?? Folder-management backend base path
   // const TARGET_BASE_PATH = "/var/www/snp_backend_03/folder-management/uploads/accounts";
  //  const absoluteFolderPath = path.join(TARGET_BASE_PATH, parentFolder);

    // Ensure folder exists
   // if (!fs.existsSync(absoluteFolderPath)) {
    //  fs.mkdirSync(absoluteFolderPath, { recursive: true });
 //   }

    // 4?? Save signed file using same original name (replaces old file)
   // const absoluteSavePath = path.join(absoluteFolderPath, originalFileName);
  //  await savePdfFromUrl(signedUrl, absoluteSavePath);

  //  console.log("Signed document replaced:", absoluteSavePath);

    // 5?? Ensure DB still points to the SAME path
  //  updatedEsign.signedFileUrl = updatedEsign.fileUrl; // same file
 //  await updatedEsign.save();

 // res.json(updatedEsign);

 //} catch (err) {
  //  console.error("Error updating e-sign:", err);
  //  res.status(500).json({ error: "Failed to update e-sign" });
 // }
//});

//app.patch("/signautrelist/update/:externalId", async (req, res) => {
///  try {
 //   const { externalId } = req.params;
  //  const { submissionId } = req.body;

  //  let updatedEsign = await EsignRequest.findOneAndUpdate(
  //    { externalId },
  //    { $set: req.body },
  //    { new: true }
  //  );

  //  if (!updatedEsign) {
  //    return res.status(404).json({ error: "No record found" });
  //  }

  //  if (!submissionId) return res.json(updatedEsign);

    // Fetch signed docs
  //  const documents = await fetchSignedDocuments(submissionId);

  //  if (!documents?.length) return res.json(updatedEsign);

  //  const signedUrl = documents[0].url;

    // Extract file path info
 //   const relativePath = decodeURIComponent(
  //    updatedEsign.fileUrl.split("/uploads/accounts/")[1]
  //  );

  //  const parts = relativePath.split("/");
  //  const originalFileName = parts.pop();
  //  const parentFolder = parts.join("/");

  //  const TARGET_BASE_PATH =
  //    "/var/www/snp_backend_03/folder-management/uploads/accounts";

  //  const absoluteFolderPath = path.join(TARGET_BASE_PATH, parentFolder);

  //  if (!fs.existsSync(absoluteFolderPath)) {
  //    fs.mkdirSync(absoluteFolderPath, { recursive: true });
  //  }

 //   const absoluteSavePath = path.join(absoluteFolderPath, originalFileName);

  //  await savePdfFromUrl(signedUrl, absoluteSavePath);

  //  console.log("Signed document replaced:", absoluteSavePath);

  //  updatedEsign.signedFileUrl = updatedEsign.fileUrl;
  //  await updatedEsign.save();

   // res.json(updatedEsign);
 // } catch (err) {
  //  console.error("Error updating e-sign:", err);
  //  res.status(500).json({ error: "Failed to update e-sign" });
 // }
//});




//app.post("/docuseal/webhook", express.json(), async (req, res) => {
 //try {
  // const event = req.body;
  // console.log("Webhook received:", event);

 //  if (event.event_type === "submission.created") {
  //   const submission = event.data;

   //  console.log("NEW SUBMISSION ID:", submission.id);
   //   console.log("External ID:", submission.template?.external_id);
// const templateName = submission.template?.name || null;
      // Map submitters to store only necessary fields
  //   const submittersData = (submission.submitters || []).map((s) => ({
     //   id: s.id,
     //   slug: s.slug,
     //   uuid: s.uuid,
      //  name: templateName,
     //   email: s.email,
     //   phone: s.phone,
      //  completed_at: s.completed_at,
      // declined_at: s.declined_at,
     //  external_id: s.external_id,
     //   submission_id: s.submission_id,
     //   metadata: s.metadata,
     //   opened_at: s.opened_at,
     //   sent_at: s.sent_at,
     //   updated_at: s.updated_at,
     //   status: s.status,
      //  application_key: s.application_key,
      //  preferences: s.preferences,
     //  role: s.role
    //  }));
// console.log("Updated submittersData :", submittersData );

      // Update EsignRequest
    //  const updated = await EsignRequest.findOneAndUpdate(
     //  { externalId: submission.template?.external_id },
    //   {
       //  submissionId: submission.id,
       //   status: "pending",
      //   submitters: submittersData, // store full submitters array
      //  },
    //   { new: true }
    // );

   //   console.log("Updated EsignRequest:", updated);
 // }

  //  res.status(200).send("OK");
 // } catch (err) {
 //  console.error("Webhook error:", err);
 //   res.status(500).send("Error");
 // }
//});
// Check if all submitters have completed
app.get("/signautrelist/check-completion/:externalId", async (req, res) => {
  try {
    const { externalId } = req.params;

    const esignRecord = await EsignRequest.findOne({ externalId });
    
    if (!esignRecord) {
      return res.status(404).json({ error: "No record found" });
    }

    // Check if all submitters have completed
    const allCompleted = esignRecord.submitters.every(submitter => 
      submitter.status === 'completed' || submitter.completed_at !== null
    );

    res.json({
      allCompleted,
      totalSubmitters: esignRecord.submitters.length,
      completedSubmitters: esignRecord.submitters.filter(s => 
        s.status === 'completed' || s.completed_at !== null
      ).length,
      submitters: esignRecord.submitters.map(s => ({
        email: s.email,
        status: s.status,
        completed_at: s.completed_at,
        role: s.role
      }))
    });
  } catch (err) {
    console.error("Error checking completion:", err);
    res.status(500).json({ error: "Failed to check completion status" });
  }
});

// Update the existing update endpoint
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

    // Only process documents when status is "completed" (all signed)
    if (req.body.status === "completed" && submissionId) {
      // Fetch signed docs
      const documents = await fetchSignedDocuments(submissionId);

      if (documents?.length) {
        const signedUrl = documents[0].url;

        // Extract file path info
        const relativePath = decodeURIComponent(
          updatedEsign.fileUrl.split("/uploads/accounts/")[1]
        );

        const parts = relativePath.split("/");
        const originalFileName = parts.pop();
        const parentFolder = parts.join("/");

        const TARGET_BASE_PATH =
          "/var/www/snp_backend_03/folder-management/uploads/accounts";

        const absoluteFolderPath = path.join(TARGET_BASE_PATH, parentFolder);

        if (!fs.existsSync(absoluteFolderPath)) {
          fs.mkdirSync(absoluteFolderPath, { recursive: true });
        }

        const absoluteSavePath = path.join(absoluteFolderPath, originalFileName);

        await savePdfFromUrl(signedUrl, absoluteSavePath);

        console.log("Signed document replaced:", absoluteSavePath);

        updatedEsign.signedFileUrl = updatedEsign.fileUrl;
        await updatedEsign.save();
      }
    }

    res.json(updatedEsign);
  } catch (err) {
    console.error("Error updating e-sign:", err);
    res.status(500).json({ error: "Failed to update e-sign" });
  }
});
// Update individual submitter status and check if all are completed
//app.patch("/signautrelist/update-submitter/:externalId", async (req, res) => {
 // try {
  //  const { externalId } = req.params;
  //  const { submitterEmail, submissionId } = req.body;

    // 1. Update the specific submitter's status to completed
  //  const updatedEsign = await EsignRequest.findOneAndUpdate(
   //   { 
    //    externalId,
   //     "submitters.email": submitterEmail 
   //   },
   //   {
     //   $set: {
      //    "submitters.$.status": "completed",
       //   "submitters.$.completed_at": new Date(),
      //    "submitters.$.updated_at": new Date(),
      //    submissionId: submissionId
      //  }
     // },
     // { new: true }
   // );

   // if (!updatedEsign) {
    //  return res.status(404).json({ error: "No record found" });
  //  }

    // 2. Check if ALL submitters have completed
  //  const allCompleted = updatedEsign.submitters.every(submitter => 
   //   submitter.status === 'completed' || submitter.completed_at !== null
  //  );

  //  const completedCount = updatedEsign.submitters.filter(submitter => 
  //    submitter.status === 'completed' || submitter.completed_at !== null
  //  ).length;

  //  const totalCount = updatedEsign.submitters.length;
  //  const pendingCount = totalCount - completedCount;

    // 3. Update overall document status
  //  let overallStatus = "in_progress";
  //  if (allCompleted) {
  //    overallStatus = "completed";
      
      // Update the main document status
    //  await EsignRequest.findOneAndUpdate(
     //   { externalId },
     //   { status: "completed" }
     // );
   // } else {
      // Update to in_progress if at least one has signed but not all
    //  await EsignRequest.findOneAndUpdate(
     //   { externalId },
      //  { status: "in_progress" }
    //  );
  //  }

  //  res.json({
    //  success: true,
    ///  allCompleted,
    //  overallStatus,
    // completedCount,
    //  totalCount,
    //  pendingCount,
    //  esignRecord: updatedEsign,
     // message: allCompleted 
     //   ? "All submitters have completed signing" 
     //   : `Waiting for ${pendingCount} more signer(s)`
   // });

//  } catch (err) {
  //  console.error("Error updating submitter status:", err);
 //   res.status(500).json({ error: "Failed to update submitter status" });
 // }
//});
// Update individual submitter status and replace document with latest signed version
app.patch("/signautrelist/update-submitter/:externalId", async (req, res) => {
  try {
    const { externalId } = req.params;
    const { submitterEmail, submissionId } = req.body;

    // 1. Find the current esign record
    const esignRecord = await EsignRequest.findOne({ externalId });
    if (!esignRecord) {
      return res.status(404).json({ error: "No record found" });
    }

    // 2. Update the specific submitter's status to completed
    const updatedEsign = await EsignRequest.findOneAndUpdate(
      { 
        externalId,
        "submitters.email": submitterEmail 
      },
      {
        $set: {
          "submitters.$.status": "completed",
          "submitters.$.completed_at": new Date(),
          "submitters.$.updated_at": new Date(),
          submissionId: submissionId
        }
      },
      { new: true }
    );

    if (!updatedEsign) {
      return res.status(404).json({ error: "Submitter not found" });
    }

    // 3. ALWAYS replace the document with the latest signed version
    console.log("?? Replacing document with latest signed version...");
    
    // Fetch signed docs from DocuSeal
    const documents = await fetchSignedDocuments(submissionId);

    if (documents?.length) {
      const signedUrl = documents[0].url;
      console.log("?? Latest signed document URL:", signedUrl);

      // Extract file path info from original fileUrl
      const relativePath = decodeURIComponent(
        esignRecord.fileUrl.split("/uploads/accounts/")[1]
      );

      const parts = relativePath.split("/");
      const originalFileName = parts.pop();
      const parentFolder = parts.join("/");

      const TARGET_BASE_PATH = "/var/www/snp_backend_03/folder-management/uploads/accounts";
      const absoluteFolderPath = path.join(TARGET_BASE_PATH, parentFolder);

      // Create directory if it doesn't exist
      if (!fs.existsSync(absoluteFolderPath)) {
        fs.mkdirSync(absoluteFolderPath, { recursive: true });
      }

      const absoluteSavePath = path.join(absoluteFolderPath, originalFileName);

      // Download and save the latest signed document
      await savePdfFromUrl(signedUrl, absoluteSavePath);

      console.log("? Document replaced with latest signatures:", absoluteSavePath);

      // Update the signedFileUrl to track the latest version
      updatedEsign.signedFileUrl = esignRecord.fileUrl;
      updatedEsign.lastUpdatedAt = new Date();
      await updatedEsign.save();
    } else {
      console.log("?? No signed documents found for submission:", submissionId);
    }

    // 4. Check if ALL submitters have completed
    const allCompleted = updatedEsign.submitters.every(submitter => 
      submitter.status === 'completed' || submitter.completed_at !== null
    );

    const completedCount = updatedEsign.submitters.filter(submitter => 
      submitter.status === 'completed' || submitter.completed_at !== null
    ).length;

    const totalCount = updatedEsign.submitters.length;
    const pendingCount = totalCount - completedCount;

    // 5. Update overall document status
    let overallStatus = "in_progress";
    if (allCompleted) {
      overallStatus = "completed";
      
      // Update the main document status
      await EsignRequest.findOneAndUpdate(
        { externalId },
        { status: "completed" }
      );
    } else {
      // Update to in_progress if at least one has signed but not all
      await EsignRequest.findOneAndUpdate(
        { externalId },
        { status: "in_progress" }
      );
    }

    res.json({
      success: true,
      allCompleted,
      overallStatus,
      completedCount,
      totalCount,
      pendingCount,
      esignRecord: updatedEsign,
      documentReplaced: true,
      message: allCompleted 
        ? "All submitters have completed signing - Document fully executed" 
        : `Document updated with your signature. Waiting for ${pendingCount} more signer(s)`
    });

  } catch (err) {
    console.error("Error updating submitter status and replacing document:", err);
    res.status(500).json({ 
      error: "Failed to update submitter status and replace document",
      details: err.message 
    });
  }
});


//app.post("/docuseal/webhook", express.json(), async (req, res) => {
 // try {
  //  const event = req.body;
  //  console.log("Webhook received:", event);

  //  if (event.event_type === "submission.completed") {
   //   const submission = event.data;
      
   //   console.log("COMPLETED SUBMISSION ID:", submission.id);
   //   console.log("External ID:", submission.template?.external_id);

      // Update individual submitter status
    //  const updated = await EsignRequest.findOneAndUpdate(
     //   { 
     //     externalId: submission.template?.external_id,
     //     "submitters.id": { $in: submission.submitters.map(s => s.id) }
    //    },
    //    {
     //     $set: {
     //       "submitters.$[elem].status": "completed",
     //       "submitters.$[elem].completed_at": new Date(),
     //       "submitters.$[elem].updated_at": new Date()
      //    }
      //  },
       // {
       //   arrayFilters: [
        //    { "elem.id": { $in: submission.submitters.map(s => s.id) } }
        //  ],
        //  new: true
       // }
    //  );

   //   console.log("Updated submitter status:", updated);

      // Check if all submitters have completed
    //  if (updated) {
     //   const allCompleted = updated.submitters.every(submitter => 
     //     submitter.status === 'completed' || submitter.completed_at !== null
     //   );

      //  if (allCompleted) {
          // Update overall status to completed
      //    await EsignRequest.findOneAndUpdate(
       //     { externalId: submission.template?.external_id },
       //     { status: "completed" }
       //   );
       //   console.log("All submitters have completed - status updated to completed");
       // } else {
          // Update overall status to in_progress
        //  await EsignRequest.findOneAndUpdate(
         //   { externalId: submission.template?.external_id },
        //    { status: "in_progress" }
        //  );
       //   console.log("Some submitters still pending - status updated to in_progress");
      //  }
    //  }
   // }
  //  else if (event.event_type === "submission.created") {
   //   const submission = event.data;
   //   const templateName = submission.template?.name || null;

      // Map submitters to store only necessary fields
   //   const submittersData = (submission.submitters || []).map((s) => ({
    //    id: s.id,
    //    slug: s.slug,
     //   uuid: s.uuid,
    //    name: templateName,
   //     email: s.email,
    //    phone: s.phone,
    //    completed_at: s.completed_at,
    //    declined_at: s.declined_at,
    //    external_id: s.external_id,
    //    submission_id: s.submission_id,
    //    metadata: s.metadata,
    //    opened_at: s.opened_at,
    //    sent_at: s.sent_at,
     //   updated_at: s.updated_at,
     //   status: s.status,
     //   application_key: s.application_key,
     //   preferences: s.preferences,
     //   role: s.role
     // }));

      // Update EsignRequest
  //    const updated = await EsignRequest.findOneAndUpdate(
      //  { externalId: submission.template?.external_id },
     //   {
      //    submissionId: submission.id,
      //    status: "pending",
      //    submitters: submittersData,
     //   },
     //   { new: true }
     // );

    //  console.log("Updated EsignRequest:", updated);
  //  }

 //   res.status(200).send("OK");
 // } catch (err) {
 //   console.error("Webhook error:", err);
 //   res.status(500).send("Error");
 // }
//});
//app.post("/docuseal/webhook", express.json(), async (req, res) => {
//  try {
 //   const event = req.body;
  //  console.log("Webhook received:", event.event_type);

 //   if (event.event_type === "submission.completed") {
  //    const submission = event.data;
      
   //   console.log("COMPLETED SUBMISSION ID:", submission.id);
   //   console.log("External ID:", submission.template?.external_id);

      // Update each completed submitter
   //   for (const submitter of submission.submitters) {
    //    if (submitter.completed_at) {
    //      const updated = await EsignRequest.findOneAndUpdate(
        //    { 
        //      externalId: submission.template?.external_id,
        //      "submitters.id": submitter.id
          //  },
         //   {
           //  $set: {
              //  "submitters.$.status": "completed",
              //  "submitters.$.completed_at": new Date(submitter.completed_at),
              //  "submitters.$.updated_at": new Date()
             // }
           // },
          //  { new: true }
        //  );

        //  console.log(`Updated submitter ${submitter.email} to completed`);

          // Check if all submitters have completed after this update
         // if (updated) {
         //   const allCompleted = updated.submitters.every(s => 
          //    s.status === 'completed' || s.completed_at !== null
           // );

            // Update overall status
         //   const overallStatus = allCompleted ? "completed" : "in_progress";
         //   await EsignRequest.findOneAndUpdate(
          //    { externalId: submission.template?.external_id },
          //    { status: overallStatus, submissionId: submission.id }
          //  );

         //   console.log(`Overall status updated to: ${overallStatus}`);
         // }
       // }
     // }
  //  }
  //  else if (event.event_type === "submission.created") {
   //   const submission = event.data;
   //   const templateName = submission.template?.name || null;

   //   const submittersData = (submission.submitters || []).map((s) => ({
   //     id: s.id,
     //   slug: s.slug,
     //   uuid: s.uuid,
     //   name: templateName,
      //  email: s.email,
      //  phone: s.phone,
      //  completed_at: s.completed_at,
     //   declined_at: s.declined_at,
      //  external_id: s.external_id,
     //   submission_id: s.submission_id,
     //   metadata: s.metadata,
     //   opened_at: s.opened_at,
       // sent_at: s.sent_at,
     //   updated_at: s.updated_at,
     //   status: s.status || 'sent',
     //   application_key: s.application_key,
    //    preferences: s.preferences,
    //    role: s.role
    //  }));

      // Update EsignRequest
     // const updated = await EsignRequest.findOneAndUpdate(
     //   { externalId: submission.template?.external_id },
     //   {
     //     submissionId: submission.id,
     //     status: "pending",
     //     submitters: submittersData,
     //   },
     //   { new: true }
    //  );

   //   console.log("Updated EsignRequest with submitters:", updated);
   // }

   // res.status(200).send("OK");
  //} catch (err) {
  //  console.error("Webhook error:", err);
  //  res.status(500).send("Error");
  //}
//});
app.post("/docuseal/webhook", express.json(), async (req, res) => {
  try {
    const event = req.body;
    console.log("Webhook received:", event.event_type);

    if (event.event_type === "submission.completed") {
      const submission = event.data;
      
      console.log("COMPLETED SUBMISSION ID:", submission.id);
      console.log("External ID:", submission.template?.external_id);

      // Update each completed submitter
      for (const submitter of submission.submitters) {
        if (submitter.completed_at) {
          const updated = await EsignRequest.findOneAndUpdate(
            { 
              externalId: submission.template?.external_id,
              "submitters.id": submitter.id
            },
            {
              $set: {
                "submitters.$.status": "completed",
                "submitters.$.completed_at": new Date(submitter.completed_at),
                "submitters.$.updated_at": new Date()
              }
            },
            { new: true }
          );

          console.log(`Updated submitter ${submitter.email} to completed`);

          // Replace document with latest signed version
          if (updated) {
            await replaceSignedDocument(updated, submission.id);
            
            // Check if all submitters have completed after this update
            const allCompleted = updated.submitters.every(s => 
              s.status === 'completed' || s.completed_at !== null
            );

            // Update overall status
            const overallStatus = allCompleted ? "completed" : "in_progress";
            await EsignRequest.findOneAndUpdate(
              { externalId: submission.template?.external_id },
              { 
                status: overallStatus, 
                submissionId: submission.id,
                lastUpdatedAt: new Date()
              }
            );

            console.log(`Overall status updated to: ${overallStatus}`);
          }
        }
      }
    }
    else if (event.event_type === "submission.created") {
      const submission = event.data;
      const templateName = submission.template?.name || null;

      const submittersData = (submission.submitters || []).map((s) => ({
        id: s.id,
        slug: s.slug,
        uuid: s.uuid,
        name: templateName,
        email: s.email,
        phone: s.phone,
        completed_at: s.completed_at,
        declined_at: s.declined_at,
        external_id: s.external_id,
        submission_id: s.submission_id,
        metadata: s.metadata,
        opened_at: s.opened_at,
        sent_at: s.sent_at,
        updated_at: s.updated_at,
        status: s.status || 'sent',
        application_key: s.application_key,
        preferences: s.preferences,
        role: s.role
      }));

      // Update EsignRequest
      const updated = await EsignRequest.findOneAndUpdate(
        { externalId: submission.template?.external_id },
        {
          submissionId: submission.id,
          status: "pending",
          submitters: submittersData,
        },
        { new: true }
      );

      console.log("Updated EsignRequest with submitters:", updated);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Error");
  }
});

// Helper function to replace document
async function replaceSignedDocument(esignRecord, submissionId) {
  try {
    const documents = await fetchSignedDocuments(submissionId);
    
    if (documents?.length) {
      const signedUrl = documents[0].url;
      
      const relativePath = decodeURIComponent(
        esignRecord.fileUrl.split("/uploads/accounts/")[1]
      );

      const parts = relativePath.split("/");
      const originalFileName = parts.pop();
      const parentFolder = parts.join("/");

      const TARGET_BASE_PATH = "/var/www/snp_backend_03/folder-management/uploads/accounts";
      const absoluteFolderPath = path.join(TARGET_BASE_PATH, parentFolder);

      if (!fs.existsSync(absoluteFolderPath)) {
        fs.mkdirSync(absoluteFolderPath, { recursive: true });
      }

      const absoluteSavePath = path.join(absoluteFolderPath, originalFileName);
      await savePdfFromUrl(signedUrl, absoluteSavePath);

      console.log(`? Document replaced via webhook: ${absoluteSavePath}`);
    }
  } catch (error) {
    console.error('Error replacing document via webhook:', error);
  }
}
app.use("/signeddoc", express.static("uploads"));
app.use("/esignuploads", express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT || 8016;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



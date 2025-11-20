const Approval = require("../models/Approval");
const sendApprovalEmail = require("../utils/sendApprovalEmail");
const Account = require("../models/AccountModel");
// ðŸ“Œ Request approval
exports.requestApproval = async (req, res) => {
  const { accountId, filename, fileUrl, clientEmail,description } = req.body;

  try {
    // Save in DB
    const approval = new Approval({
      accountId,
      filename,
      fileUrl,
      clientEmail,
description
    });
    await approval.save();

    // Send email
    await sendApprovalEmail({
      to: clientEmail,
      subject: "Document Approval Request",
      html: `
        <p>Hello,</p>
        <p>You have a new document approval request</p>
         <p><strong>Document Name:</strong> ${filename}</p>
         <p>Please login to your account and approve it:</p>
      `,
    });
//  <p><a href="${fileUrl}" target="_blank">${filename}</a></p>
    res.json({
      message: "Approval request sent and saved",
      approvalId: approval._id,
    });
  } catch (err) {
    console.error("Request approval error:", err);
    res.status(500).json({ error: "Failed to send approval request" });
  }
};

// ?? Get all pending approvals for client
exports.getClientApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({
        
      // clientEmail: req.params.email,
     // status: "pending",
       accountId: req.params.accountId,
      status: "pending",
    }).sort({ createdAt: -1 });

    res.json({ approvals });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
};

// // ?? Get all pending approvals for a specific account
exports.getClientApprovalsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const approvals = await Approval.find({
      accountId: accountId,

         }).sort({ createdAt: -1 });

    res.json({ approvals });
  } catch (err) {
    console.error("Error fetching approvals:", err);
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
};

exports.getPendingApprovalsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const pendingApprovals = await Approval.find({
      accountId: accountId,
      status: "pending", // filter by pending status
    }).sort({ createdAt: -1 });

    res.json({ pendingApprovals });
  } catch (err) {
    console.error("Error fetching pending approvals:", err);
    res.status(500).json({ error: "Failed to fetch pending approvals" });
  }
};

// ðŸ“Œ Update approval status and send email
//exports.updateApprovalStatus = async (req, res) => {
  //try {
   // const { action } = req.body; // approve or cancel

  //  const updated = await Approval.findByIdAndUpdate(
     // req.params.id,
    //  { status: action === "approve" ? "approved" : "cancelled" },
    //  { new: true }
   // );

   // if (!updated) {
   //   return res.status(404).json({ error: "Approval not found" });
  //  }

    // ðŸ“© Send email to client if approved
  //  if (action === "approve") {
   //   await sendApprovalEmail({
     //   to: updated.clientEmail,
     //   subject: "Document Approved",
     //   html: `
      //    <p>Dear Client,</p>
       //   <p>Your document <strong>${updated.filename}</strong> has been approved.</p>
         
          
     //   `
   //   });
   // }

  //  res.json({ success: true, approval: updated });
 // } catch (err) {
  //  console.error(err);
   // res.status(500).json({ error: "Failed to update approval" });
//  }
//};


//exports.updateApprovalStatus = async (req, res) => {
  //try {
   // const { action, description, adminUserId } = req.body; // action = 'approve' or 'cancel'

   // console.log("Admin User ID (email):", adminUserId);

    // Update approval status and optional description
   // const updated = await Approval.findByIdAndUpdate(
    //  req.params.id,
    //  {
     //   status: action === "approve" ? "approved" : "cancelled",
     //   ...(description && { description }),
     // },
     // { new: true }
   // ).populate("accountId", "accountName")

//console.log("updated status",updated)   
// if (!updated) {
     // return res.status(404).json({ error: "Approval not found" });
  //  }

    // ? Send email to the ADMIN instead of the client
  //  if (adminUserId) {
    //  if (action === "approve") {
       // await sendApprovalEmail({
        //  to: adminUserId, // Send to admin
        //  subject: `Document Approved: ${updated.filename}`,
        //  html: `
        //    <p>Dear Admin,</p>
         //   <p>The document <strong>${updated.filename}</strong> for account <strong>${updated.accountId}</strong> has been <span style="color:green;">approved</span>.</p>
         //   <p>Thank you for reviewing the document.</p>
         // `,
       // });
     // } else if (action === "cancel") {
       // await sendApprovalEmail({
        //  to: adminUserId, // Send to admin
        //  subject: `Document Approval Cancelled: ${updated.filename}`,
        //  html: `
          //  <p>Dear Admin,</p>
          //  <p>The document <strong>${updated.filename}</strong> for account <strong>${updated.accountId}</strong> has been <span style="color:red;">cancelled</span>.</p>
           // ${description ? `<p><strong>Reason:</strong> ${description}</p>` : ""}
          //  <p>Please follow up if needed.</p>
         // `,
       // });
     // }
   // } else {
    //  console.log("?? No admin email provided — skipping email sending");
  //  }

   // res.json({
   //   success: true,
    //  approval: updated,
    //  message: adminUserId
      //  ? "Status updated and email sent to admin"
       // : "Status updated (email skipped — admin email missing)",
   // });
//  } catch (err) {
   // console.error("Error updating approval status:", err);
  //  res.status(500).json({ error: "Failed to update approval" });
 // }
//};
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { action, description, adminUserId } = req.body; // 'approve' or 'cancel'
    console.log("Admin User ID (email):", adminUserId);

    // Update approval status
    let updated = await Approval.findByIdAndUpdate(
      req.params.id,
      {
        status: action === "approve" ? "approved" : "cancelled",
        ...(description && { description }),
      },
      { new: true }
    ).populate("accountId", "accountName"); // ? populate accountName

    if (!updated) {
      return res.status(404).json({ error: "Approval not found" });
    }

    // Flatten accountName for easier frontend use
    const accountName = updated.accountId?.accountName || "Unknown Account";
 
    const approvalResponse = {
      ...updated.toObject(),
      accountName, // add flattened field

    };

    // Send email to admin
    if (adminUserId) {
      let emailSubject, emailHtml;

      if (action === "approve") {
        emailSubject = `#Document Approved: ${updated.filename}`;
        emailHtml = `
         
          <p>The document <strong>${updated.filename}</strong> for account <strong>${accountName}</strong> has been <span style="color:green;">approved</span>.</p>
          <p>Thank you for reviewing the document.</p>
        `;
      } else if (action === "cancel") {
        emailSubject = `#Document Approval Cancelled: ${updated.filename}`;
        emailHtml = `
                   <p>The document <strong>${updated.filename}</strong> for account <strong>${accountName}</strong> has been <span style="color:red;">cancelled</span>.</p>
          ${description ? `<p><strong>Reason:</strong> ${description}</p>` : ""}
          <p>Please follow up if needed.</p>
        `;
      }

      await sendApprovalEmail({
        to: adminUserId,
        subject: emailSubject,
        html: emailHtml,
      });
    } else {
      console.log("?? No admin email provided — skipping email sending");
    }

    // Respond
    res.json({
      success: true,
      approval: approvalResponse,
      message: adminUserId
        ? "Status updated and email sent to admin"
        : "Status updated (email skipped — admin email missing)",
    });
  } catch (err) {
    console.error("Error updating approval status:", err);
    res.status(500).json({ error: "Failed to update approval" });
  }
};

// Delete Approval by ID
exports.deleteApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedApproval = await Approval.findByIdAndDelete(id);

    if (!deletedApproval) {
      return res.status(404).json({ error: "Approval not found" });
    }

    res.status(200).json({ message: "Approval deleted successfully" });
  } catch (error) {
    console.error("Error deleting approval:", error);
    res.status(500).json({ error: "Failed to delete approval" });
  }
};

const mongoose = require("mongoose");
const sendApprovalEmail = require('../utils/sendApprovalEmail'); // Adjust path

const approvalSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientAccount",
      required: true,
    },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    clientEmail: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ?? AUTO-SEND EMAIL ON NEW APPROVAL (post-save middleware)
approvalSchema.post('save', async function(doc) {
  if (doc.status === 'pending') { // Only for new pending approvals
    console.log(`?? Auto-email trigger for ${doc.filename} ? ${doc.clientEmail}`);
    
    try {
      await sendApprovalEmail({
        to: doc.clientEmail,
        subject: `Document Approval Required: ${doc.filename}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Document Approval Request</h2>
            <p>Hello,</p>
            <p>Please review the document:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h3 style="margin-top: 0;"><strong>${doc.filename}</strong></h3>
              <p><strong>Description:</strong> ${doc.description || 'No description'}</p>
             
            </div>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Login: <a href="https://snptaxes.com">snptaxes.com</a></li>
              <li>Find document & click Approve/Decline</li>
            </ul>
            <p>Thank you,<br><strong>Firm Docs Team</strong></p>
          </div>
        `
      });
      console.log(`? AUTO-EMAIL sent to ${doc.clientEmail}`);
    } catch (error) {
      console.error(`? AUTO-EMAIL failed for ${doc.clientEmail}:`, error.message);
    }
  }
});

module.exports = mongoose.model("Approval", approvalSchema);

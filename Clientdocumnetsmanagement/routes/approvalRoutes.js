const express = require("express");
const router = express.Router();
const approvalController = require("../controller/approvalController");

router.post("/request-approval", approvalController.requestApproval);
router.get("/client-approvals/:email", approvalController.getClientApprovals);
router.patch("/client-approvals/:id", approvalController.updateApprovalStatus);
router.get("/approvalList/byaccountid/:accountId", approvalController.getClientApprovalsByAccount);
router.get('/approvalList/:accountId/pending', approvalController.getPendingApprovalsByAccount);
router.delete("/:id", approvalController.deleteApproval);
module.exports = router;

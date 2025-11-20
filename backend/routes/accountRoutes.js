
// routes/accountRoutes.js
const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");

router.post("/", accountController.createAccount);
router.post("/sendBulkEmails", accountController.sendBulkEmails);
// POST /api/accounts/assignbulktags/tomultipleaccount
router.post("/assignbulktags/tomultipleaccount", accountController.assignBulkTagsToMultipleAccount);

// POST /api/accounts/assignbulktags/removetags
router.post("/assignbulktags/removetags", accountController.removeBulkTagsFromAccounts);
// POST /api/accounts/teamMembertomultipleaccount
router.post("/manageteammember/teamMembertomultipleaccount", accountController.assignTeamMembersToMultipleAccounts);
router.post("/multiple", accountController.getMultipleAccountsByIds);
// POST /api/accounts/removeteammember
router.post("/manageteammember/removeteammember", accountController.removeTeamMembersFromAccounts);
router.put("/:id", accountController.updateAccount);
router.get("/", accountController.getAccounts);
router.get("/accountlist/names", accountController.getAccountNames);
router.get("/accountlist/names-by-status", accountController.getAccountNamesByStatus);
router.get("/byTeam", accountController.getAccountsByTeamMember);
router.patch("/accountdetails/updateaccounttags/:id", accountController.updateAccountTags);
router.get("/list", accountController.getAccountsList);
router.get("/:id", accountController.getAccountById);
router.patch("/update-active", accountController.updateAccountActiveStatus);
// Toggle canLogin for a contact
router.patch(
  "/:accountId/contact/:contactId",
  accountController.toggleContactLogin
);

router.post('/:accountId/contacts', accountController.addContactsToAccount);
router.get('/:accountId/contacts', accountController.getAccountContacts);
router.delete('/:accountId/contact/:contactId', accountController.removeContactFromAccount);

router.delete('/accounts/deleteMultipleAccounts', accountController.deleteMultipleAccounts );




module.exports = router;

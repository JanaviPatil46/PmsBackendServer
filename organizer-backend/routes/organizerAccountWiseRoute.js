const express = require("express");
const router = express.Router();

const {updateOrganizer,renameOrganizerAccountWise , autoSaveOrganizer,updateOrganizerAndNotify,updateFormElementActiveStatus,getPendingOrganizersByAccountId,getActiveOrganizerByAccountId,createOrganizerAccountWise, getOrganizerAccountWise, getOrganizerAccountWises, deleteOrganizerAccountWise,updateOrganizerAccountWiseStatus, getOrganizerByAccountId, updateOrganizerAccountWise } = require("../controller/organizerAccountWiseController");

//******organizer Accountwise Start******** */

router.get("/organizeraccountwise", getOrganizerAccountWises);
router.get("/organizeraccountwise/:id", getOrganizerAccountWise);
router.post("/organizeraccountwise/org", createOrganizerAccountWise);
router.delete("/organizeraccountwise/:id", deleteOrganizerAccountWise);
router.get("/organizeraccountwise/organizerbyaccount/:id", getOrganizerByAccountId);
router.get("/organizeraccountwise/organizerbyaccount/:id/:isactive", getActiveOrganizerByAccountId);
router.patch("/organizeraccountwise/:id", updateOrganizerAccountWise);
router.patch("/organizeraccountwise/active-archive/:id", updateOrganizer);
router.patch("/organizeraccountwise/completeandnotify/:id", updateOrganizerAndNotify);
router.patch("/organizeraccountwise/organizeraccountwisestatus/:id/:issubmited", updateOrganizerAccountWiseStatus);
router.get("/organizer/pending/:id", getPendingOrganizersByAccountId);
router.patch(
  '/:organizerId/sections/:sectionId/form-elements/:formElementId',
  updateFormElementActiveStatus
);

router.patch(
    '/autosave/:id',
  
    autoSaveOrganizer
);
// routes/organizers.js
router.patch(
  "/rename/:id",
  renameOrganizerAccountWise
);


//******organizer Accountwise ENd******** */

module.exports = router;

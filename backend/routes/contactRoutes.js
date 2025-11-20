const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", contactController.createContact);
router.put("/:id", contactController.updateContact);
router.put("/contact/:id", contactController.updateContactwithoutPassword );
router.get("/", contactController.getContacts);
router.delete("/delete-multiple", contactController.deleteContacts);
// Activation routes
router.get('/activate/verify/:token', contactController.verifyActivationToken);
router.post('/activate/set-password/:token', contactController.activateAndSetPassword);
router.post('/:contactId/resend-activation', contactController.resendActivationEmail);
router.get("/contact-names", contactController.getContactNames);
router.get("/contact/:id", contactController.getContactById);



module.exports = router;

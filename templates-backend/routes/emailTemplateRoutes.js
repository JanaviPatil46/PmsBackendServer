const express = require('express');
const router = express.Router();
const upload = require('../multerConfig'); // Adjust the path as necessary
const { checkTemplateNameExists,deleteAttachment,getEmailTemplates,createEmailTemplate,getEmailTemplate,deleteEmailTemplate, updateEmailTemplate,getEmailTemplateList } = require('../controller/emailTemplateController')

router.get('/emailtemplate', getEmailTemplates)
router.get('/emailtemplate/:id', getEmailTemplate)
router.get('/emailtemplate/emailtemplateList/:id', getEmailTemplateList)
// router.post('/emailtemplate', createEmailTemplate)
// router.delete('/emailtemplate/:id', deleteEmailTemplate)
// router.patch('/emailtemplate/:id', updateEmailTemplate)
// router.post('/emailtemplate', createEmailTemplate);
router.post('/emailtemplate', (req, res) => {
    // Multer middleware handles file uploads before passing control to createEmailTemplate
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload failed" });
      }
      createEmailTemplate(req, res);
    });
  });
router.delete('/emailtemplate/:id', deleteEmailTemplate)
// router.patch('/emailtemplate/:id', updateEmailTemplate)
router.patch('/emailtemplate/:id', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload failed" });
      }
      updateEmailTemplate(req, res);
    });
  });


  router.delete('/deleteattachments/:templateId/:filename', deleteAttachment);
router.get('/check-name', checkTemplateNameExists);
module.exports = router;
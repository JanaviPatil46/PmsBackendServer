// routes/jobTemplateRoutes.js
const express = require('express');
const router = express.Router();
const {checkTemplateNameExists,createJobTemplate, getJobTemplate, getJobTemplates, deleteJobTemplate, updateJobTemplate, getJobTemplateList} = require('../controller/jobTemplateCotroller');

router.get('/jobtemplate', getJobTemplates)
router.get('/jobtemplate/:id', getJobTemplate)
router.post('/jobtemplate', createJobTemplate)
router.delete('/jobtemplate/:id', deleteJobTemplate)
router.patch('/jobtemplate/:id', updateJobTemplate)
router.get('/jobtemplate/jobtemplatelist/:id', getJobTemplateList)
router.get('/check-name', checkTemplateNameExists);
module.exports = router;

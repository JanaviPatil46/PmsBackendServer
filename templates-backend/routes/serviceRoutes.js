const express = require ('express');
const router = express.Router();
const { getServiceTemplates, getServiceTemplate, createServiceTemplate, deleteServiceTemplate, updateServiceTemplate, getServiceTemplateById } = require('../controller/serviceTemplateController')

router.get('/servicetemplate', getServiceTemplates)
router.get('/servicetemplate/:id', getServiceTemplate)
router.post('/servicetemplate', createServiceTemplate)
router.delete('/servicetemplate/:id', deleteServiceTemplate)
router.patch('/servicetemplate/:id', updateServiceTemplate)
router.get('/servicetemplate/servicetemplatebyid/:id', getServiceTemplateById)

module.exports = router
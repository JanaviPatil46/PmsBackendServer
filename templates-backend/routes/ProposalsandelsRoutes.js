// routes/jobTemplateRoutes.js
const express = require('express');
const router = express.Router();
const {createProposalesAndElsTemplate, getProposalesAndElsTemplate, getProposalesAndElsTemplates, deleteProposalesAndElsTemplate, updateProposalesAndElsTemplate, getProposalesAndElsTemplateById} = require('../controller/proposalsandelsController');

router.get('/proposalesandels', getProposalesAndElsTemplates)
router.get('/proposalesandels/:id', getProposalesAndElsTemplate)
router.post('/proposalesandels', createProposalesAndElsTemplate)
router.delete('/proposalesandels/:id', deleteProposalesAndElsTemplate)
router.patch('/proposalesandels/:id', updateProposalesAndElsTemplate)
router.get('/proposalesandelslist/:id', getProposalesAndElsTemplateById)

module.exports = router;

const express = require('express');
const router = express.Router();
const { createFolderTemplate ,getFolderTemplates, renameFolderTemplate,
  deleteFolderTemplate,getFolderTemplateById } = require('../controllers/folderTemController'); // Adjust path as needed

// POST /api/folder-template
router.post('/folder-template', createFolderTemplate);
router.get('/templatelist',getFolderTemplates);
router.patch("/rename/:id", renameFolderTemplate);
router.delete("/delete/:id", deleteFolderTemplate);
router.get('/:id', getFolderTemplateById);

module.exports = router;

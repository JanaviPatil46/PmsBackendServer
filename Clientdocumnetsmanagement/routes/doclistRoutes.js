const express = require('express');
const router = express.Router();
const documentController = require('../controller/documentController');

// Create a new document
router.post('/', documentController.createDocument);

// Get all documents
router.get('/', documentController.getAllDocuments);

// Get a document by ID
router.get('/:id', documentController.getDocumentById);

// Update a document
router.patch('/:id', documentController.updateDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

// Get documents by account ID
router.get('/account/:accountId', documentController.getDocumentsByAccountId);
module.exports = router;

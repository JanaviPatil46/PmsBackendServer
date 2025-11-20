const express = require('express');
const router = express.Router();
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require( "../controller/DocManagementController");
// import { protect } from "../middleware/authMiddleware.js"; // Middleware to verify users


router.post("/", createDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;

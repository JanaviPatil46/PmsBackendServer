// import Document from "../models/DocManagamentModel";
const Document = require("../models/DocManagamentModel")
const mongoose = require("mongoose");
// Create a new document
 const createDocument = async (req, res) => {
  try {
    const { fileName, filePath, fileType, allowedToUpdate, allowedToDelete, allowedToView } = req.body;
    const uploadedBy = req.user.id; // Assuming user is authenticated

    const newDocument = new Document({
      fileName,
      filePath,
      fileType,
      uploadedBy,
      allowedToUpdate,
      allowedToDelete,
      allowedToView,
    });

    await newDocument.save();
    res.status(201).json({ message: "Document created successfully", document: newDocument });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all documents
 const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate("uploadedBy", "name email").populate("allowedToView", "name email");
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get a single document by ID
 const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate("uploadedBy", "name email");
    if (!document) return res.status(404).json({ message: "Document not found" });

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a document
 const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (!document.allowedToUpdate.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to update this document" });
    }

    Object.assign(document, req.body);
    await document.save();

    res.status(200).json({ message: "Document updated successfully", document });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete a document
 const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (!document.allowedToDelete.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this document" });
    }

    await document.deleteOne();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


module.exports = {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
};
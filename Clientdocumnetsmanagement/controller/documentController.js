const Document = require('../models/document');

// Controller for creating a new document
exports.createDocument = async (req, res) => {
  try {
    const { name, uploadedAt, uploadedBy, permissions, path,isNewFile } = req.body;

    const newDocument = new Document({
      name,
      uploadedAt,
      uploadedBy,
      permissions,
      path,
      isNewFile
    });

    await newDocument.save();

    res.status(201).json({ message: 'Document created successfully', document: newDocument });
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error });
  }
};


// Controller for retrieving all documents
// exports.getAllDocuments = async (req, res) => {
//   try {
//     const documents = await Document.find().populate('uploadedBy', 'name');

//     // Add `daysSinceUpload` to each document object
//     const response = documents.map(doc => ({
//       ...doc.toObject(),
//       daysSinceUpload: doc.daysSinceUpload,
//     }));

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching documents', error });
//   }
// console.log("recvie all docs")
// };

exports.getAllDocuments = async (req, res) => {
    try {
      const documents = await Document.find().populate('uploadedBy', 'name');
  
      // Add `daysSinceUpload` to each document object
      const response = documents.map(doc => ({
        ...doc.toObject(),
        daysSinceUpload: doc.daysSinceUpload,
      }));
  
      console.log("Received all documents"); // Log successful fetch
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching documents:", error); // Log the error
      res.status(500).json({ message: 'Error fetching documents', error });
    }
  };
  

// Controller for retrieving a single document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('uploadedBy', 'name');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({
      ...document.toObject(),
      daysSinceUpload: document.daysSinceUpload,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error });
  }
};

// Controller for updating a document
// exports.updateDocument = async (req, res) => {
//   try {
//     const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     if (!document) {
//       return res.status(404).json({ message: 'Document not found' });
//     }

//     res.status(200).json({ message: 'Document updated successfully', document });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating document', error });
//   }
// };
exports.updateDocument = async (req, res) => {
    try {
      // Add the current date to `uploadedAt` whenever a document is updated
      const updateData = { 
        ...req.body,
        uploadedAt: new Date(), // Update the uploadedAt field
      };
  
      const document = await Document.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      res.status(200).json({ message: 'Document updated successfully', document });
    } catch (error) {
      res.status(500).json({ message: 'Error updating document', error });
    }
  };
  

// Controller for deleting a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
};





exports.getDocumentsByAccountId = async (req, res) => {
  try {
    const { accountId } = req.params; // Get account ID from URL parameters

    // Fetch all documents uploaded by the specified account
    const documents = await Document.find({ uploadedBy: accountId }).populate('uploadedBy', 'name');

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for the specified account' });
    }

    // Add `daysSinceUpload` to each document
    const response = documents.map(doc => ({
      ...doc.toObject(),
      daysSinceUpload: doc.daysSinceUpload,
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents by account ID', error });
  }
};

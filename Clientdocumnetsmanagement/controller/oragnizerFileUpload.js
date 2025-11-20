// const path = require('path');

// const uploadFile = (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
//     const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
//     res.status(200).json({
//       message: 'File uploaded successfully',
//       filePath: `/uploads/${req.file.filename}`, // File accessible URL
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'File upload failed', error });
//   }
// };

// module.exports = { uploadFile };


const path = require('path');
const fs = require('fs');

// const uploadFile = (req, res) => {
//   try {
//     const { accountId } = req.body; // Expect accountId from the request body

//     if (!accountId) {
//       return res.status(400).json({ message: 'Account ID is required' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     // Construct the target directory
//     const targetDir = path.join(__dirname, '..', 'uploads', accountId, 'FirmClient Uploaded Document');

//     // Create the directory if it doesn't exist
//     fs.mkdirSync(targetDir, { recursive: true });

//     // Move the file to the target directory
//     const targetPath = path.join(targetDir, req.file.filename);
//     fs.renameSync(req.file.path, targetPath);

//     // Respond with success and file location
//     const relativePath = `/uploads/${accountId}/FirmClient Uploaded Document/${req.file.filename}`;
//     res.status(200).json({
//       message: 'File uploaded successfully',
//       filePath: relativePath,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'File upload failed', error });
//   }
// };
const uploadFile = (req, res) => {
  try {
    const { accountId } = req.body; // Expect accountId from the request body

    if (!accountId) {
      return res.status(400).json({ message: 'Account ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the target directory
    const targetDir = path.join(__dirname, '..', 'uploads', accountId, 'FirmClient Uploaded Document');

    // Create the directory if it doesn't exist
    fs.mkdirSync(targetDir, { recursive: true });

    // Move the file to the target directory with its original name
    const targetPath = path.join(targetDir, req.file.originalname);
    fs.renameSync(req.file.path, targetPath);

    // Respond with success and file location
    const relativePath = `/uploads/${accountId}/FirmClient Uploaded Document/${req.file.originalname}`;
    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: relativePath,
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error });
  }
};
module.exports = { uploadFile };

// const Client = require('../models/Client');

// // Default folders for new clients
// const defaultFolders = [
//   { name: 'Client Uploaded Document', type: 'Client' },
//   { name: 'Firm Doc Shared with Client', type: 'Firm' },
//   { name: 'Private', type: 'Private' },
// ];

// // Create a new client with default folders
// exports.createClient = async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     // Check if the client already exists
//     const existingClient = await Client.findOne({ email });
//     if (existingClient) {
//       return res.status(400).json({ message: 'Client already exists!' });
//     }

//     // Create a new client
//     const newClient = new Client({
//       name,
//       email,
//       folders: defaultFolders,
//     });

//     await newClient.save();
//     res.status(201).json({ message: 'Client created successfully', client: newClient });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating client', error: error.message });
//   }
// };

// // Fetch all clients
// exports.getClients = async (req, res) => {
//   try {
//     const clients = await Client.find();
//     res.status(200).json(clients);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching clients', error: error.message });
//   }
// };



// exports.getFoldersByAccountId = async (req, res) => {
//   try {
//       const { accountId } = req.params;

//       if (!accountId) {
//           return res.status(400).json({ message: "Account ID is required" });
//       }

//       console.log("Fetching folders for Account ID:", accountId);

//       // Define the account directory path
//       const baseDir = path.join(__dirname, '../uploads');
//       const accountDir = path.join(baseDir, accountId);

//       // Check if the account directory exists
//       if (!fs.existsSync(accountDir)) {
//           return res.status(404).json({ message: "Account folder does not exist" });
//       }

//       // Read and filter directories within the account folder
//       const items = fs.readdirSync(accountDir, { withFileTypes: true });
//       const folders = items
//           .filter((item) => item.isDirectory())
//           .map((folder) => folder.name);

//       res.status(200).json({
//           message: "Folders fetched successfully",
//           accountId,
//           folders,
//       });
//   } catch (error) {
//       console.error('Error in getFoldersByAccountId:', error);
//       res.status(500).json({
//           message: "An error occurred while fetching folders",
//           error: error.message,
//       });
//   }
// };
// try {
  //   // Extract accountId from the request body
  //   const { accountId } = req.body;

  //   if (!accountId) {
  //     return res.status(400).json({ message: "Account ID is required" });
  //   }

  //   // Define the directory where folders will be created
  //   const baseDir = path.join(__dirname, '../uploads'); // Adjust the base directory as needed
  //   const folderPath = path.join(baseDir, accountId);

  //   // Check if the folder already exists
  //   if (fs.existsSync(folderPath)) {
  //     return res.status(400).json({ message: "Folder already exists" });
  //   }

  //   // Create the folder
  //   fs.mkdirSync(folderPath, { recursive: true });

  //   // Respond with success
  //   res.status(201).json({ message: `Folder created for account ID: ${accountId}` });
  // } catch (error) {
  //   console.error('Error creating folder:', error);
  //   res.status(500).json({ message: "An error occurred while creating the folder", error: error.message });
  // }
  // const { accountId ,foldertempId} = req.body;
  // console.log(accountId)
  // console.log(foldertempId)

//   try {
//     const { accountId, foldertempId } = req.body;

//     if (!accountId) {
//         return res.status(400).json({ message: "Account ID is required" });
//     }

//     console.log("Account ID:", accountId);
//     console.log("Folder Template ID:", foldertempId);

//     // Define the base uploads directory
//     const baseDir = path.join(__dirname, '../uploads');
//     const accountDir = path.join(baseDir, accountId);

//     // Check if the account folder exists
//     if (!fs.existsSync(accountDir)) {
//         return res.status(404).json({ message: "Account folder does not exist" });
//     }

//     // Define the new subfolder path
//     const newFolderPath = path.join(accountDir, 'janavi');

//     // Check if the 'janavi' folder already exists
//     if (fs.existsSync(newFolderPath)) {
//         return res.status(400).json({ message: "'janavi' folder already exists" });
//     }

//     // Create the 'janavi' folder
//     fs.mkdirSync(newFolderPath);

//     res.status(201).json({ message: "'janavi' folder created successfully", folderPath: newFolderPath });
// } catch (error) {
//     console.error('Error in folderTemplate:', error);
//     res.status(500).json({ message: "An error occurred while creating the folder", error: error.message });
// }

// try {
//   const { accountId, foldertempId } = req.body;

//   if (!accountId) {
//       return res.status(400).json({ message: "Account ID is required" });
//   }

//   console.log("Account ID:", accountId);
//   console.log("Folder Template ID:", foldertempId);

//   // Define the base uploads directory and the specific folder path
//   const baseDir = path.join(__dirname, '../uploads');
//   const accountDir = path.join(baseDir, accountId);
//   const targetFolder = path.join(accountDir, 'FirmClient Uploaded Document');

//   // Check if the account folder exists
//   if (!fs.existsSync(accountDir)) {
//       return res.status(404).json({ message: "Account folder does not exist" });
//   }

//   // Check if the 'FirmClient Uploaded Document' folder exists
//   if (!fs.existsSync(targetFolder)) {
//       return res.status(404).json({ message: "'FirmClient Uploaded Document' folder does not exist" });
//   }

//   // Define the new subfolder path
//   const newFolderPath = path.join(targetFolder, 'janavi');

//   // Check if the 'janavi' folder already exists
//   if (fs.existsSync(newFolderPath)) {
//       return res.status(400).json({ message: "'janavi' folder already exists" });
//   }

//   // Create the 'janavi' folder
//   fs.mkdirSync(newFolderPath);

//   res.status(201).json({ message: "'janavi' folder created successfully inside 'FirmClient Uploaded Document'", folderPath: newFolderPath });
// } catch (error) {
//   console.error('Error in folderTemplate:', error);
//   res.status(500).json({ message: "An error occurred while creating the folder", error: error.message });
// }



// try {
//   const { accountId, foldertempId } = req.body;

//   if (!accountId || !foldertempId) {
//       return res.status(400).json({ message: "Both accountId and foldertempId are required" });
//   }

//   console.log("Account ID:", accountId);
//   console.log("Folder Template ID:", foldertempId);

//   // Define paths
//   const baseDir = path.join(__dirname, '../uploads');
//   const templatesDir = path.join(baseDir, 'folderTemplates');
//   const targetAccountDir = path.join(baseDir, accountId);
//   const targetFolder = path.join(targetAccountDir, 'FirmClient Uploaded Document');
//   const sourceFolder = path.join(templatesDir, foldertempId, 'FirmClient Uploaded Document');

//   // Check if the account folder exists
//   if (!fs.existsSync(targetAccountDir)) {
//       return res.status(404).json({ message: "Account folder does not exist" });
//   }

//   // Check if the target folder exists in the account directory
//   if (!fs.existsSync(targetFolder)) {
//       return res.status(404).json({ message: "'FirmClient Uploaded Document' folder does not exist in the account directory" });
//   }

//   // Check if the source folder exists
//   if (!fs.existsSync(sourceFolder)) {
//       return res.status(404).json({ message: `'FirmClient Uploaded Document' folder not found in folderTemplate ID: ${foldertempId}` });
//   }

//   // Copy contents from source folder to target folder
//   const copyRecursiveSync = (src, dest) => {
//       if (!fs.existsSync(dest)) {
//           fs.mkdirSync(dest, { recursive: true });
//       }

//       const entries = fs.readdirSync(src, { withFileTypes: true });
//       for (const entry of entries) {
//           const srcPath = path.join(src, entry.name);
//           const destPath = path.join(dest, entry.name);

//           if (entry.isDirectory()) {
//               // Recursively copy directories
//               copyRecursiveSync(srcPath, destPath);
//           } else {
//               // Copy files
//               fs.copyFileSync(srcPath, destPath);
//           }
//       }
//   };

//   copyRecursiveSync(sourceFolder, targetFolder);

//   res.status(200).json({
//       message: "Contents copied successfully from template to target folder",
//       source: sourceFolder,
//       destination: targetFolder,
//   });
// } catch (error) {
//   console.error('Error in folderTemplate:', error);
//   res.status(500).json({ message: "An error occurred while copying folders/files", error: error.message });
// }
// D:\PMS-FINAL\AdminBackend\folder-template\uploads\FolderTemplates
// D:\PMS-FINAL\AdminBackend\Clientdocumnetsmanagement\uploads\folderTemplates

// try {
//   const { accountId, foldertempId } = req.body;

//   if (!accountId || !foldertempId) {
//       return res.status(400).json({ message: "Both accountId and foldertempId are required" });
//   }

//   console.log("Account ID:", accountId);
//   console.log("Folder Template ID:", foldertempId);

//   // Define paths
//   const baseDir = path.join(__dirname, '../uploads');
//   const templatesDir = path.join(baseDir, 'folderTemplates');
//   const targetAccountDir = path.join(baseDir, accountId);

//   // Folder names to handle
//   const foldersToHandle = [
//       'FirmClient Uploaded Document',
//       'Firm Doc Shared With Client',
//       'Private',
//   ];

//   // Check if the account folder exists
//   if (!fs.existsSync(targetAccountDir)) {
//       return res.status(404).json({ message: "Account folder does not exist" });
//   }

//   // Process each folder
//   const copyRecursiveSync = (src, dest) => {
//       if (!fs.existsSync(dest)) {
//           fs.mkdirSync(dest, { recursive: true });
//       }

//       const entries = fs.readdirSync(src, { withFileTypes: true });
//       for (const entry of entries) {
//           const srcPath = path.join(src, entry.name);
//           const destPath = path.join(dest, entry.name);

//           if (entry.isDirectory()) {
//               // Recursively copy directories
//               copyRecursiveSync(srcPath, destPath);
//           } else {
//               // Copy files
//               fs.copyFileSync(srcPath, destPath);
//           }
//       }
//   };

//   const copiedFolders = [];

//   for (const folderName of foldersToHandle) {
//       const sourceFolder = path.join(templatesDir, foldertempId, folderName);
//       const targetFolder = path.join(targetAccountDir, folderName);

//       // Check if the source folder exists
//       if (!fs.existsSync(sourceFolder)) {
//           console.warn(`Source folder not found: ${sourceFolder}`);
//           continue; // Skip if the source folder doesn't exist
//       }

//       // Check if the target folder exists
//       if (!fs.existsSync(targetFolder)) {
//           fs.mkdirSync(targetFolder, { recursive: true });
//       }

//       // Copy contents from source to target
//       copyRecursiveSync(sourceFolder, targetFolder);
//       copiedFolders.push({ source: sourceFolder, destination: targetFolder });
//   }

//   if (copiedFolders.length === 0) {
//       return res.status(404).json({
//           message: "None of the specified folders were found in the template directory",
//       });
//   }

//   res.status(200).json({
//       message: "Contents copied successfully from template to target folders",
//       copiedFolders,
//   });
// } catch (error) {
//   console.error('Error in folderTemplate:', error);
//   res.status(500).json({
//       message: "An error occurred while copying folders/files",
//       error: error.message,
//   });
// }

const Client = require('../models/client');
// const Account = require('../models/AccountModel');
const fs = require('fs');
const path = require('path');
const FolderTempFile = require('../models/FolderTempFileModel'); // adjust path as needed
const File = require('../models/FileModel');

// Create a new client linked to an account
// exports.createClient = async (req, res) => {
//   try {
//     // Extract accountId from the request body
//     const { accountId } = req.body;

//     if (!accountId) {
//       return res.status(400).json({ message: "Account ID is required" });
//     }

//     // Define the base directory for the account
//     const baseDir = path.join(__dirname, '../uploads/AccountId');
//     const accountDir = path.join(baseDir, accountId);

//     // Subfolder names
//     const subfolders = [
//       'Client Uploaded Documents',
//       'Firm Docs Shared With Client',
//       'Private'
//     ];

//     // Check if the account folder already exists
//     if (fs.existsSync(accountDir)) {
//       return res.status(400).json({ message: "Account folder already exists" });
//     }

//     // Create the account folder and subfolders
//     fs.mkdirSync(accountDir, { recursive: true });
//     subfolders.forEach(subfolder => {
//       const subfolderPath = path.join(accountDir, subfolder);
//       fs.mkdirSync(subfolderPath);
//     });

//     // Respond with success
//     res.status(201).json({
//       message: `Account folder and subfolders created for account ID: ${accountId}`,
//       folders: [accountDir, ...subfolders.map(name => path.join(accountDir, name))]
//     });
//   } catch (error) {
//     console.error('Error creating folders:', error);
//     res.status(500).json({ message: "An error occurred while creating folders", error: error.message });
//   }
// };
exports.createClient = async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required" });
    }

    const baseDir = path.join(__dirname, '../uploads/AccountId');
    const accountDir = path.join(baseDir, accountId);

    const subfolders = [
      'Client Uploaded Documents',
      'Firm Docs Shared With Client',
      'Private'
    ];

    if (fs.existsSync(accountDir)) {
      return res.status(400).json({ message: "Account folder already exists" });
    }

    fs.mkdirSync(accountDir, { recursive: true });

    const createdFolders = [accountDir];

    subfolders.forEach(subfolder => {
      const subfolderPath = path.join(accountDir, subfolder);
      fs.mkdirSync(subfolderPath);
      createdFolders.push(subfolderPath);

      // If subfolder is 'Client Uploaded Documents', create 'sealed' and 'unsealed' inside it
      if (subfolder === 'Client Uploaded Documents') {
        const sealedPath = path.join(subfolderPath, 'sealed');
        const unsealedPath = path.join(subfolderPath, 'unsealed');
        fs.mkdirSync(sealedPath);
        fs.mkdirSync(unsealedPath);
        createdFolders.push(sealedPath, unsealedPath);
      }
    });

    res.status(201).json({
      message: `Account folder and subfolders created for account ID: ${accountId}`,
      folders: createdFolders
    });
  } catch (error) {
    console.error('Error creating folders:', error);
    res.status(500).json({ message: "An error occurred while creating folders", error: error.message });
  }
};

exports.createSubFolder = async (req, res) => {
  try {
    // Extract accountId and subFolderName from the request body
    const { accountId, subFolderName } = req.body;

    if (!accountId || !subFolderName) {
      return res.status(400).json({ message: "Account ID and Subfolder name are required" });
    }

    // Define the base directory for the account
    const baseDir = path.join(__dirname, '../uploads');
    const accountDir = path.join(baseDir, accountId);

    // Check if the account folder exists
    if (!fs.existsSync(accountDir)) {
      return res.status(404).json({ message: "Account folder not found" });
    }

    // Define the path for the new subfolder inside the account folder
    const newSubfolderPath = path.join(accountDir, subFolderName);

    // Check if the subfolder already exists
    if (fs.existsSync(newSubfolderPath)) {
      return res.status(400).json({ message: "Subfolder already exists" });
    }

    // Create the new subfolder
    fs.mkdirSync(newSubfolderPath);

    // Respond with success
    res.status(201).json({
      message: `New subfolder '${subFolderName}' created for account ID: ${accountId}`,
      subfolder: newSubfolderPath
    });
  } catch (error) {
    console.error('Error creating subfolder:', error);
    res.status(500).json({ message: "An error occurred while creating the subfolder", error: error.message });
  }
};
// Route to create a folder inside a subfolder of the account folder
exports.createFolderInSubfolder= async (req, res) => {
  try {
    const { accountId, subFolderName, newFolderName } = req.body;

    // Check if required fields are provided
    if (!accountId || !subFolderName || !newFolderName) {
      return res.status(400).json({ message: "Account ID, Subfolder Name, and New Folder Name are required" });
    }

    // Define the base directory for the account
    const baseDir = path.join(__dirname, '../uploads');
    const accountDir = path.join(baseDir, accountId);

    // Check if the account folder exists
    if (!fs.existsSync(accountDir)) {
      return res.status(404).json({ message: "Account folder not found" });
    }

    // Define the path for the subfolder where we want to create the new folder
    const subfolderPath = path.join(accountDir, subFolderName);

    // Check if the subfolder exists
    if (!fs.existsSync(subfolderPath)) {
      return res.status(404).json({ message: "Subfolder not found" });
    }

    // Define the path for the new folder to be created inside the subfolder
    const newFolderPath = path.join(subfolderPath, newFolderName);

    // Check if the new folder already exists
    if (fs.existsSync(newFolderPath)) {
      return res.status(400).json({ message: `Folder '${newFolderName}' already exists in subfolder '${subFolderName}'` });
    }

    // Create the new folder inside the subfolder
    fs.mkdirSync(newFolderPath);

    // Respond with success
    res.status(201).json({
      message: `Folder '${newFolderName}' created successfully inside subfolder '${subFolderName}' in account ID: ${accountId}`,
      folderPath: newFolderPath
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ message: "An error occurred while creating the folder", error: error.message });
  }
};

// delete the subfolder
exports.deleteSubFolder = async (req, res) => {
  try {
    const { accountId, subFolderName } = req.body;

    if (!accountId || !subFolderName) {
      return res.status(400).json({ message: "Account ID and Subfolder Name are required" });
    }

    // Define the base directory for the account
    const baseDir = path.join(__dirname, '../uploads');
    const accountDir = path.join(baseDir, accountId);

    // Check if the account folder exists
    if (!fs.existsSync(accountDir)) {
      return res.status(404).json({ message: "Account folder not found" });
    }

    // Define the path for the subfolder to be deleted
    const subfolderPath = path.join(accountDir, subFolderName);

    // Check if the subfolder exists
    if (!fs.existsSync(subfolderPath)) {
      return res.status(404).json({ message: "Subfolder not found" });
    }

    // Delete the subfolder
    fs.rmdirSync(subfolderPath, { recursive: true });

    res.status(200).json({
      message: `Subfolder '${subFolderName}' deleted successfully from account ID: ${accountId}`
    });
  } catch (error) {
    console.error('Error deleting subfolder:', error);
    res.status(500).json({ message: "An error occurred while deleting the subfolder", error: error.message });
  }
};

// exports.folderTemplate = async (req, res) => {

// try {
//   const { accountId, foldertempId } = req.body;

//   if (!accountId || !foldertempId) {
//       return res.status(400).json({ message: "Both accountId and foldertempId are required" });
//   }

//   console.log("Account ID:", accountId);
//   console.log("Folder Template ID:", foldertempId);

//   // Define paths
//   const baseDir = path.join(__dirname, '../uploads/AccountId');
 
//   const templatesDir = path.join(__dirname, '..', '..', 'folder-template', 'uploads', 'FolderTemplates');
//   const targetAccountDir = path.join(baseDir, accountId);
  
//   // Folder names to handle
//   const foldersToHandle = [
//     'Client Uploaded Documents',
//     'Firm Docs Shared With Client',
//     'Private'
//   ];

//   // Check if the account folder exists
//   if (!fs.existsSync(targetAccountDir)) {
//     console.error(`Account folder does not exist at path: ${targetAccountDir}`);
//       return res.status(404).json({ message: "Account folder does not exist" });
//   }

//   // Process each folder
//   const copyRecursiveSync = (src, dest) => {
//       if (!fs.existsSync(dest)) {
//           fs.mkdirSync(dest, { recursive: true });
//       }

//       const entries = fs.readdirSync(src, { withFileTypes: true });
//       for (const entry of entries) {
//           const srcPath = path.join(src, entry.name);
//           const destPath = path.join(dest, entry.name);

//           if (entry.isDirectory()) {
//               // Recursively copy directories
//               copyRecursiveSync(srcPath, destPath);
//           } else {
//               // Copy files
//               fs.copyFileSync(srcPath, destPath);
//           }
//       }
//   };

//   const copiedFolders = [];

//   for (const folderName of foldersToHandle) {
//       const sourceFolder = path.join(templatesDir, foldertempId, folderName);
//       const targetFolder = path.join(targetAccountDir, folderName);

//       // Check if the source folder exists
//       if (!fs.existsSync(sourceFolder)) {
//           console.warn(`Source folder not found: ${sourceFolder}`);
//           continue; // Skip if the source folder doesn't exist
//       }

//       // Check if the target folder exists
//       if (!fs.existsSync(targetFolder)) {
//           fs.mkdirSync(targetFolder, { recursive: true });
//       }

//       // Copy contents from source to target
//       copyRecursiveSync(sourceFolder, targetFolder);
//       copiedFolders.push({ source: sourceFolder, destination: targetFolder });
//   }

//   if (copiedFolders.length === 0) {
//       return res.status(404).json({
//           message: "None of the specified folders were found in the template directory",
//       });
//   }

//   res.status(200).json({
//       message: "Contents copied successfully from template to target folders",
//       copiedFolders,
//   });
// } catch (error) {
//   console.error('Error in folderTemplate:', error);
//   res.status(500).json({
//       message: "An error occurred while copying folders/files",
//       error: error.message,
//   });
// }
// }

// Fetch all clients for a specific account









// exports.folderTemplate = async (req, res) => {
//   try {
//     const { accountId, foldertempId } = req.body;

//     if (!accountId || !foldertempId) {
//       return res.status(400).json({ message: "Both accountId and foldertempId are required" });
//     }

//     console.log("Account ID:", accountId);
//     console.log("Folder Template ID:", foldertempId);

//     // Define base paths
//     const baseDir = path.join(__dirname, '../uploads/AccountId');
//     const templatesDir = path.join(__dirname, '..', '..', 'folder-template', 'uploads', 'FolderTemplates');
//     const targetAccountDir = path.join(baseDir, accountId);

//     const foldersToHandle = [
//       'Client Uploaded Documents',
//       'Private'
//     ];

//     if (!fs.existsSync(targetAccountDir)) {
//       console.error(`Account folder does not exist at path: ${targetAccountDir}`);
//       return res.status(404).json({ message: "Account folder does not exist" });
//     }

//     // Recursive copy function
//     const copyRecursiveSync = (src, dest) => {
//       if (!fs.existsSync(src)) return;

//       if (!fs.existsSync(dest)) {
//         fs.mkdirSync(dest, { recursive: true });
//       }

//       const entries = fs.readdirSync(src, { withFileTypes: true });
//       for (const entry of entries) {
//         const srcPath = path.join(src, entry.name);
//         const destPath = path.join(dest, entry.name);

//         if (entry.isDirectory()) {
//           copyRecursiveSync(srcPath, destPath);
//         } else {
//           fs.copyFileSync(srcPath, destPath);
//         }
//       }
//     };

//     const copiedFolders = [];

//     for (const folderName of foldersToHandle) {
//       const sourceFolder = path.join(templatesDir, foldertempId, folderName);
//       const targetFolder = path.join(targetAccountDir, folderName);

//       if (!fs.existsSync(sourceFolder)) {
//         console.warn(`Source folder not found: ${sourceFolder}`);
//         continue;
//       }

//       copyRecursiveSync(sourceFolder, targetFolder);
//       copiedFolders.push({ source: sourceFolder, destination: targetFolder });
//     }

//     if (copiedFolders.length === 0) {
//       return res.status(404).json({
//         message: "None of the specified folders were found in the template directory",
//       });
//     }

//     res.status(200).json({
//       message: "Contents copied successfully from template to target folders",
//       copiedFolders,
//     });
//   } catch (error) {
//     console.error('Error in folderTemplate:', error);
//     res.status(500).json({
//       message: "An error occurred while copying folders/files",
//       error: error.message,
//     });
//   }
// };






exports.folderTemplate = async (req, res) => {
  try {
    const { accountId, foldertempId } = req.body;

    if (!accountId || !foldertempId) {
      return res.status(400).json({ message: "Both accountId and foldertempId are required" });
    }

    console.log("Account ID:", accountId);
    console.log("Folder Template ID:", foldertempId);

    // Define base paths
    const baseDir = path.join(__dirname, '../uploads/AccountId');
    const templatesDir = path.join(__dirname, '..', '..', 'folder-template', 'uploads', 'FolderTemplates');
    const targetAccountDir = path.join(baseDir, accountId);

    const foldersToHandle = [
      'Client Uploaded Documents',
      'Firm Docs Shared With Client',
      'Private'
    ];

    if (!fs.existsSync(targetAccountDir)) {
      console.error(`Account folder does not exist at path: ${targetAccountDir}`);
      return res.status(404).json({ message: "Account folder does not exist" });
    }

    // Recursive copy function
    const copyRecursiveSync = (src, dest) => {
      if (!fs.existsSync(src)) return;

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          copyRecursiveSync(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    const copiedFolders = [];

    for (const folderName of foldersToHandle) {
      const sourceFolder = path.join(templatesDir, foldertempId, folderName);
      const targetFolder = path.join(targetAccountDir, folderName);

      if (!fs.existsSync(sourceFolder)) {
        console.warn(`Source folder not found: ${sourceFolder}`);
        continue;
      }

      copyRecursiveSync(sourceFolder, targetFolder);
      copiedFolders.push({ source: sourceFolder, destination: targetFolder });
    }

    // ✅ EXTRA: Copy DB entries from FolderTemplate -> Account for "Firm Docs Shared With Client"
    const firmDocsTemplatePath = `uploads/FolderTemplates/${foldertempId}/Firm Docs Shared With Client`;
    const firmDocsAccountPath = `uploads/AccountId/${accountId}/Firm Docs Shared With Client`;

    const templateFiles = await FolderTempFile.find({
      templateId: foldertempId,
      filePath: { $regex: `^${firmDocsTemplatePath}` }
    });

    const copiedDbFilesToAccount = [];

    for (const file of templateFiles) {
      const relativePath = file.filePath.replace(firmDocsTemplatePath, '');
      const newFilePath = `${firmDocsAccountPath}${relativePath}`;

      const newFile = new File({
        filename: file.filename,
        filePath: newFilePath,
        accountId: accountId,
        permissions: file.permissions,
      });

      await newFile.save();
      copiedDbFilesToAccount.push(newFile);
    }

    if (copiedFolders.length === 0 && copiedDbFilesToAccount.length === 0) {
      return res.status(404).json({
        message: "No folders or Firm Docs Shared With Client files were found to copy",
      });
    }

    res.status(200).json({
      message: "Contents copied successfully",
      copiedFolders,
      copiedDbFilesToAccountCount: copiedDbFilesToAccount.length,
    });
  } catch (error) {
    console.error('Error in folderTemplate:', error);
    res.status(500).json({
      message: "An error occurred while copying folders/files",
      error: error.message,
    });
  }
};




exports.getClientsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const clients = await Client.find({ accountId }).populate('accountId');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};


exports.getFoldersAndFilesByAccountId = async (req, res) => {
  try {
      const { accountId } = req.params;

      if (!accountId) {
          return res.status(400).json({ message: "Account ID is required" });
      }

      // console.log("Fetching files and folders for Account ID:", accountId);

      // Define the account directory path
      const baseDir = path.join(__dirname, '../uploads');
      const accountDir = path.join(baseDir, accountId);

      // Check if the account directory exists
      if (!fs.existsSync(accountDir)) {
          return res.status(404).json({ message: "Account folder does not exist" });
      }

      // Function to get all files and folders recursively
      const getContents = (directory) => {
          const items = fs.readdirSync(directory, { withFileTypes: true });
          return items.map((item) => {
              const itemPath = path.join(directory, item.name);
              if (item.isDirectory()) {
                  return {
                      name: item.name,
                      type: 'folder',
                      contents: getContents(itemPath), // Recursive call for subdirectories
                  };
              } else {
                  return {
                      name: item.name,
                      type: 'file',
                  };
              }
          });
      };

      // Get all contents of the account directory
      const contents = getContents(accountDir);

      res.status(200).json({
          message: "Contents fetched successfully",
          accountId,
          contents,
      });
  } catch (error) {
      console.error('Error in getFoldersAndFilesByAccountId:', error);
      res.status(500).json({
          message: "An error occurred while fetching folders and files",
          error: error.message,
      });
  }
};





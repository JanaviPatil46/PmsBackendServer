
const fs = require('fs');
const path = require('path');

exports.getClientsFoldersAndFiles = async (req, res) => {
    try {
        const { _id } = req.params;
  
        if (!_id) {
            return res.status(400).json({ message: " ID is required" });
        }
  
        console.log("Fetching files and folders for id :", _id);
  
        // Define the account directory path
        const baseDir = path.join(__dirname, '../uploads');
        const accountDir = path.join(baseDir, _id);
  
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
            _id,
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
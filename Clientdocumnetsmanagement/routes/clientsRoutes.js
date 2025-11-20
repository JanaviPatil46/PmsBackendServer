const express = require('express');
const {createFolderInSubfolder,deleteSubFolder,createSubFolder, createClient, getClientsByAccount ,folderTemplate,getFoldersAndFilesByAccountId,} = require('../controller/clientController');
const {getClientsFoldersAndFiles} = require('../controller/showclientdocs')

const router = express.Router();

// Create a folder with accountid
router.post('/clients', createClient);
// create subfolders in accountid folder
router.post('/clients/folders', createSubFolder);
// delete subfolders from account id folder
router.delete('/clients/deleteSubFolder', deleteSubFolder)
// create new folder in subfolder
router.post('/clients/folders/newfolder',createFolderInSubfolder)
// Get all clients for a specific account
router.get('/clients/account/:accountId', getClientsByAccount);
router.post('/accountfoldertemp', folderTemplate);
router.get('/folders/:accountId', getFoldersAndFilesByAccountId);
router.get('/clinetsfolders/:_id', getClientsFoldersAndFiles);
// getClientsFoldersAndFiles

module.exports = router;

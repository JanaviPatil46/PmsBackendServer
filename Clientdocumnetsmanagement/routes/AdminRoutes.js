const express = require("express");
const router = express.Router();
const {renameItem,deleteItem,getsFirmDocs,moveBetweenSealedUnsealed, getsClientUploadedDocsUnsealed,getsClientUploadedDocssealed,getsPrivateDocs,getsClientUploadedDocs} = require("../controller/adminController");

router.get("/unsealed/:id", getsClientUploadedDocsUnsealed);
router.get("/sealedFolders/:id",getsClientUploadedDocssealed)
router.get("/privateDocs/:id",getsPrivateDocs)
router.get("/firmDocs/:id",getsFirmDocs)
router.get("/clientDocs/:id",getsClientUploadedDocs)
router.delete('/delete-item', deleteItem)
router.patch('/rename-item', renameItem)
router.post('/moveBetweenSealedUnsealed', moveBetweenSealedUnsealed);
// MOVE from unsealed to sealed
// router.post("/client-docs/move-to-sealed/:id", moveClientUploadedDocsToSealed);

// router.get("/clientFolders/:id",getClientPublicFolders)
// router.get("/unsealeddocuments/:id",getUnsealedClientDocuments)
// router.get("/filtereddocs/:id",getFilteredClientFolders)

module.exports = router;

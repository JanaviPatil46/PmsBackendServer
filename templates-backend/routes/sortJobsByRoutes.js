const express = require ('express');
const router = express.Router();
const { createSortJobsBy,  getSortJobsBy,  getSortJobBy,  deleteSortJobsBy,  updateSortJobsBy} = require("../controller/sortJobsByController")

router.get('/sortjobby', getSortJobsBy)
router.get('/sortjobby/:id', getSortJobBy)
router.post('/sortjobby', createSortJobsBy)
router.delete('/sortjobby/:id', deleteSortJobsBy)
router.patch('/sortjobby/:id', updateSortJobsBy)
module.exports = router
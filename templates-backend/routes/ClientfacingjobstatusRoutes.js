const express = require ('express');
const router = express.Router();
const {getAllClientfacingjobstatuses,getSingleClientfacingjobstatuses,createClientfacingjobstatuses,deleteClientfacingjobstatuses,updateClientfacingjobstatus} = require('../controller/cliendfacingjobstatusesController')

// gets all tags
router.get('/', getAllClientfacingjobstatuses)

// get single tag
router.get('/:id', getSingleClientfacingjobstatuses)

// post new tag
router.post('/', createClientfacingjobstatuses)

// delete tag
router.delete('/:id', deleteClientfacingjobstatuses)

// update tag
router.patch('/:id', updateClientfacingjobstatus)

module.exports = router
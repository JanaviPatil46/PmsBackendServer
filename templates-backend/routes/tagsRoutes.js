const express = require ('express');
const router = express.Router();
const {findTagsByName,getAllTags,getSingleTag,createTag,deleteTags,updateTags,getaccountcounttags} = require('../controller/tagController')

// gets all tags
router.get('/', getAllTags)

// get single tag
router.get('/:id', getSingleTag)

// post new tag
router.post('/', createTag)

// delete tag
router.delete('/:id', deleteTags)

// update tag
router.patch('/:id', updateTags)

// get single tag
router.get('/accountcountoftag/account', getaccountcounttags)

router.get("/find", findTagsByName);


module.exports = router
const express = require('express');
const {
    getNewSidebarData,
    createNewSidebarData,
    updateNewSidebarData,
    deleteNewSidebarData,
    getNewSidebarDataMenu
} = require('../controllers/newSidebarDataController')

const router = express.Router()

// GEt all workout
router.get('/', getNewSidebarData)
// Post a new 
router.post('/', createNewSidebarData)

// Get a single sidebardata
router.get('/:id', getNewSidebarDataMenu)



// delete a  sidebardata menu
router.delete('/:id', deleteNewSidebarData)

//  update a  sidebardata menu
router.patch('/:id', updateNewSidebarData)

module.exports = router
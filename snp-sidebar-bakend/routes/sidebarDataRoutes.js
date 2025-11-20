const express = require('express');
const {
    getSidebarData,
    createSidebarData,
    getSidebarDataMenu,
    deleteSidebarData,
    updateSidebarData
} = require('../controllers/sidebarDataController')

const router = express.Router()

// GEt all sidebardata
router.get('/', getSidebarData)

// Get a single sidebardata
router.get('/:id', getSidebarDataMenu)

// Post a new sidebardata
router.post('/', createSidebarData)

// delete a  sidebardata menu
router.delete('/:id', deleteSidebarData)

//  update a  sidebardata menu
router.patch('/:id', updateSidebarData)
module.exports = router
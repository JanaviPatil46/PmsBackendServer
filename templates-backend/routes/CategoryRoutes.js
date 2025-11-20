const express = require ('express');
const router = express.Router();
const { getCategorys, getCategory, createCategory, deleteCategory, updateCategory } = require('../controller/categoryController')

router.get('/categorys', getCategorys)
router.get('/category/:id', getCategory)
router.post('/newcategory', createCategory)
router.delete('/category/:id', deleteCategory)
router.patch('/category/:id', updateCategory)

module.exports = router
const express = require ('express');
const router = express.Router();
const { checkTemplateNameExists,getInvoiceTemplates, getInvoiceTemplate, createInvoiceTemplate, deleteInvoiceTemplate, updateInvoiceTemplate } = require('../controller/invoiceTemplateController')


router.get('/invoicetemplate', getInvoiceTemplates)
router.get('/invoicetemplate/:id', getInvoiceTemplate)
router.post('/invoicetemplate', createInvoiceTemplate)
router.delete('/invoicetemplate/:id', deleteInvoiceTemplate)
router.patch('/invoicetemplate/:id', updateInvoiceTemplate)
router.get('/check-name', checkTemplateNameExists);
module.exports = router
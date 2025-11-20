

const express = require ('express');
const router = express.Router();

const { checkTemplateNameExists,getChatTemplates, getChatTemplate, getChatTemplateList, createChatTemplate, deleteChatTemplate, updateChatTemplate } = require('../controller/ChatTempController') 


router.get('/chattemplate', getChatTemplates)
router.get('/chattemplate/:id', getChatTemplate)
router.get('/chattemplate/chattemplateList/:id', getChatTemplateList)
router.post('/chattemplate', createChatTemplate)
router.delete('/chattemplate/:id', deleteChatTemplate)
router.patch('/chattemplate/:id', updateChatTemplate)

router.get('/check-name', checkTemplateNameExists);

module.exports = router
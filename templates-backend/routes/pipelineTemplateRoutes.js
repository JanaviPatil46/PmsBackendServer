const express = require('express')
const router = express.Router()
const {checkTemplateNameExists,getPipelinesWithActiveJobsCount, getPipelinesByUserId,getPipelines, getPipeline, createPipeline, updatePipeline, deletePipeline, getPipelineTemplateList} = require('../controller/pipelineTemplateController')
router.get('/pipelines', getPipelines)
router.get('/pipelines/:userid', getPipelinesByUserId)
router.get('/pipeline/:id', getPipeline)
router.post('/createpipeline', createPipeline)
router.delete('/pipeline/:id', deletePipeline)
router.patch('/pipeline/:id', updatePipeline)
router.get('/pipeline/pipelinelist/:id', getPipelineTemplateList)
// getPipelinesWithActiveJobsCount
router.get('/pipelines/count', getPipelinesWithActiveJobsCount)
router.get('/check-name', checkTemplateNameExists);
module.exports = router
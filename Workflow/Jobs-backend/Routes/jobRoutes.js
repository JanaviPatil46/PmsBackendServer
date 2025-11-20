const express = require("express");
const router = express.Router();
const { deleteJobsByAccount,getJobsByAccount,getPipelinesFromJobList,  getActiveJobCount ,getActiveJobListByUserid,
    getInactiveJobCount  ,getJobsCount,getActiveJobList, createJob, getJobs, getJob, deleteJob, updateJob, getJobList, getJobListbyid, updatestgeidtojob, getActiveJobListbyAccountId } = require("../Controller/jobController");
router.get("/job", getJobs);
router.get("/jobscount", getJobsCount);
router.get("/activejobcounts",getActiveJobCount);
router.get("/inactivejobcounts",getInactiveJobCount)
router.get("/job/:id", getJob);
router.post("/newjob", createJob);
router.delete("/job/:id", deleteJob);
router.patch("/job/:id", updateJob);
router.get("/job/joblist/list", getJobList);
router.get("/job/joblist/list/:isActive", getActiveJobList);
router.get("/job/joblist/listbyid/:id", getJobListbyid);
router.post("/job/jobpipeline/updatestageid/:id", updatestgeidtojob);
router.get("/job/joblist/list/:isActive/:accountid", getActiveJobListbyAccountId);
router.get("/joblist/list/:userid/:isActive", getActiveJobListByUserid);
router.get("/joblist/pipelines/:userid/:isActive", getPipelinesFromJobList);
// getJobsByAccountIds
router.get("/accountjoblist/:accountId", getJobsByAccount);
router.delete("/by-account/:accountId", deleteJobsByAccount);


module.exports = router;
// getActiveJobList

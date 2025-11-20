const express = require("express");
const router = express.Router();

const { createFirmSetting, getFirmSettings, getFirmSetting, deleteFirmSetting, updateFirmSetting, getFirmSettingsByAdminUserId, getFirmSettingsByTeamMember } = require("../controller/firmsettingController");

//*******************ADMIN SIGNUP START********************* */
router.get("/firmsetting", getFirmSettings);
router.get("/firmsetting/:id", getFirmSetting);
router.post("/firmsetting", createFirmSetting);
router.delete("/firmsetting/:id", deleteFirmSetting);
router.patch("/firmsetting/:id", updateFirmSetting);
router.get("/firmsetting/Firmsettingbyuserid/:id", getFirmSettingsByAdminUserId);
router.get("/firmsetting/FirmSettingsByTeamMember/:id", getFirmSettingsByTeamMember);

//*******************ADMIN SIGNUP END********************* */

module.exports = router;

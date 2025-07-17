const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportControllers');
router.post('/report-count', controller.getCounts);
router.post('/report-comparison', controller.getComparisonReport)
router.post('/all-report', controller.getOverallReport)
module.exports = router
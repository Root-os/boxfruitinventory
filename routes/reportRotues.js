const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportControllers');
router.get('/report-count', controller.getCounts);
router.get('/report-comparison', controller.getComparisonReport)
module.exports = router
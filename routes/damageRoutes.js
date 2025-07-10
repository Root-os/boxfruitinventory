const router = require('express').Router();
const controller = require('../controllers/damageController');

router.post('/', controller.createDamage);

module.exports = router;
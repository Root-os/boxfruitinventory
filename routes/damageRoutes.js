const router = require('express').Router();
const controller = require('../controllers/damageController');

router.post('/', controller.createDamage);
router.get('/damge-byshop/:id',controller.getDamgeByShopId)
module.exports = router;
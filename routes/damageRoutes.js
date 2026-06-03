const router = require('express').Router();
const controller = require('../controllers/damageController');

router.post('/', controller.createDamage);
router.get('/', controller.getAllDamages); 
router.get('/byshop/:shopId',controller.getDamgeByShopId);
router.put('/:id', controller.updateDamage);   
router.delete('/:id', controller.deleteDamage); 

module.exports = router;
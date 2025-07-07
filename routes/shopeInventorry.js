const express = require('express');
const router = express.Router();
const controller = require('../controllers/shopInventoryController');

router.post('/', controller.create); // assign purchase item to shop
router.get('/', controller.getAll);  // all inventory across shops
router.get('/shop/:shopId', controller.getByShop); // inventory for a specific shop
router.delete('/:id', controller.delete); // delete inventory assignment

router.get('/shop/count/:shopId', controller.getStockByShop); // total per item for a shop
router.post('/transfer', controller.transferToShop); // transfer item to a shop
module.exports = router;

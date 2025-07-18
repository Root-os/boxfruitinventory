const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');


router.get('/', itemController.getAllItems);
router.get('/getItemByName', itemController.getItemByName);
router.get('/:id', itemController.getItemById);
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);
router.get('/getItemByName', itemController.getItemByName);


module.exports = router;

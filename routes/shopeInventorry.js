const express = require('express');
const shopInventoryRoutes = express.Router();
const controller = require('../controllers/shopInventoryController');
const transferController = require('../controllers/transferController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ShopInventory:
 *       type: object
 *       required:
 *         - shopId
 *         - purchaseId
 *         - itemId
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the inventory record
 *         shopId:
 *           type: integer
 *           description: ID of the shop
 *         purchaseId:
 *           type: integer
 *           description: ID of the purchase record
 *         itemId:
 *           type: integer
 *           description: ID of the item
 *         quantity:
 *           type: integer
 *           description: Quantity of the item in inventory
 *       example:
 *         id: 1
 *         shopId: 1
 *         purchaseId: 2
 *         itemId: 3
 *         quantity: 50
 */

/**
 * @swagger
 * tags:
 *   name: ShopInventory
 *   description: Shop inventory management endpoints
 */
/**
 * @swagger
 * /api/shop-inventory:
 *   post:
 *     summary: Create a new shop inventory entry
 *     tags: [ShopInventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShopInventory'
 *     responses:
 *       201:
 *         description: Shop inventory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopInventory'
 *       400:
 *         description: Invalid input
 */
shopInventoryRoutes.post('/', controller.create);
shopInventoryRoutes.put('/:id', controller.updateShopInventory); 

/**
 * @swagger
 * /api/shop-inventory:
 *   get:
 *     summary: Get all shop inventory entries
 *     tags: [ShopInventory]
 *     responses:
 *       200:
 *         description: List of all inventory entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShopInventory'
 */
shopInventoryRoutes.get('/', controller.getAll);  

/**
 * @swagger
 * /api/shop-inventory/shop/{shopId}:
 *   get:
 *     summary: Get inventory entries by shop ID
 *     tags: [ShopInventory]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the shop
 *     responses:
 *       200:
 *         description: Inventory entries for the specified shop
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShopInventory'
 *       404:
 *         description: Shop not found or no inventory
 */
shopInventoryRoutes.get('/shop/:shopId', controller.getByShop); 

/**
 * @swagger
 * /api/shop-inventory/{id}:
 *   delete:
 *     summary: Delete a shop inventory entry by ID
 *     tags: [ShopInventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the inventory entry to delete
 *     responses:
 *       204:
 *         description: Inventory entry deleted successfully
 *       404:
 *         description: Inventory entry not found
 */
shopInventoryRoutes.delete('/:id', controller.delete); 

/**
 * @swagger
 * /api/shop-inventory/shop/count/{shopId}:
 *   get:
 *     summary: Get stock count by shop ID
 *     tags: [ShopInventory]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the shop
 *     responses:
 *       200:
 *         description: Stock count for the specified shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shopId:
 *                   type: integer
 *                 totalQuantity:
 *                   type: integer
 *               example:
 *                 shopId: 1
 *                 totalQuantity: 150
 *       404:
 *         description: Shop not found
 */
shopInventoryRoutes.get('/shop/count/:shopId', controller.getStockByShop); 

/**
 * @swagger
 * /api/shop-inventory/transfer:
 *   post:
 *     summary: Transfer inventory between shops
 *     tags: [ShopInventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromShopId
 *               - toShopId
 *               - itemId
 *               - quantity
 *             properties:
 *               fromShopId:
 *                 type: integer
 *                 description: ID of the shop transferring out inventory
 *               toShopId:
 *                 type: integer
 *                 description: ID of the shop receiving inventory
 *               itemId:
 *                 type: integer
 *                 description: ID of the item being transferred
 *               quantity:
 *                 type: integer
 *                 description: Quantity to transfer
 *             example:
 *               fromShopId: 1
 *               toShopId: 2
 *               itemId: 3
 *               quantity: 10
 *     responses:
 *       200:
 *         description: Inventory transferred successfully
 *       400:
 *         description: Invalid input or insufficient quantity
 */
//routes for transfering shop to shop
shopInventoryRoutes.post('/transfer', transferController.transferToShop); 
shopInventoryRoutes.get('/transfer', transferController.getAllTransfers);
shopInventoryRoutes.put('/transfer/:id', transferController.updateTransfer);
shopInventoryRoutes.delete('/transfer/:id', transferController.deleteTransfer);


shopInventoryRoutes.post('/report', controller.stockReport)

module.exports = shopInventoryRoutes;

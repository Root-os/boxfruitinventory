const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Shop:
 *       type: object
 *       required:
 *         - name
 *         - salesmanId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the shop
 *         name:
 *           type: string
 *           description: Name of the shop
 *         salesmanId:
 *           type: integer
 *           description: ID of the salesman user assigned to the shop
 *       example:
 *         id: 1
 *         name: Bole Supermarket
 *         salesmanId: 2
 */

/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Shop management endpoints
 */

/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: Retrieve a list of all shops
 *     tags: [Shops]
 *     responses:
 *       200:
 *         description: List of shops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shop'
 */
router.get('/', shopController.getAllShops);

/**
 * @swagger
 * /api/shops/{id}:
 *   get:
 *     summary: Get a shop by ID
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the shop to get
 *     responses:
 *       200:
 *         description: Shop found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       404:
 *         description: Shop not found
 */
router.get('/:id', shopController.getShopById);

/**
 * @swagger
 * /api/shops:
 *   post:
 *     summary: Create a new shop
 *     tags: [Shops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - salesmanId
 *             properties:
 *               name:
 *                 type: string
 *               salesmanId:
 *                 type: integer
 *             example:
 *               name: Bole Supermarket
 *               salesmanId: 2
 *     responses:
 *       201:
 *         description: Shop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Invalid input
 */
router.post('/', shopController.createShop);

/**
 * @swagger
 * /api/shops/{id}:
 *   put:
 *     summary: Update a shop by ID
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of shop to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               salesmanId:
 *                 type: integer
 *             example:
 *               name: Updated Supermarket
 *               salesmanId: 3
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Shop not found
 */
router.put('/:id', shopController.updateShop);

/**
 * @swagger
 * /api/shops/{id}:
 *   delete:
 *     summary: Delete a shop by ID
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of shop to delete
 *     responses:
 *       204:
 *         description: Shop deleted successfully
 *       404:
 *         description: Shop not found
 */
router.delete('/:id', shopController.deleteShop);

router.get('/user/:id', shopController.getShopsByOwnerId);
router.post('/report/shop-report', shopController.profitLossReport);
module.exports = router;

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - quantity
 *         - unit
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated item ID
 *         name:
 *           type: string
 *           description: Name of the item
 *         description:
 *           type: string
 *           description: Item description
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the item
 *         quantity:
 *           type: integer
 *           description: Available quantity
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., pcs, kg)
 *         category:
 *           type: string
 *           description: Item category
 *       example:
 *         id: 1
 *         name: Apple
 *         description: Fresh red apples
 *         price: 2.5
 *         quantity: 100
 *         unit: pcs
 *         category: Fruits
 */

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management endpoints
 */

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('/', itemController.getAllItems);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 */
router.get('/:id', itemController.getItemById);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *               category:
 *                 type: string
 *             example:
 *               name: Banana
 *               description: Fresh yellow bananas
 *               price: 1.5
 *               quantity: 200
 *               unit: pcs
 *               category: Fruits
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid input
 */
router.post('/', itemController.createItem);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *               category:
 *                 type: string
 *             example:
 *               name: Banana Updated
 *               description: Fresh ripe bananas
 *               price: 1.75
 *               quantity: 180
 *               unit: pcs
 *               category: Fruits
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Item not found
 */
router.put('/:id', itemController.updateItem);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', itemController.deleteItem);

module.exports = router;

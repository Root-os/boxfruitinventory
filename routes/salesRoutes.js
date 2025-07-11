const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - customerId
 *         - itemId
 *         - quantity
 *         - totalPrice
 *         - saleDate
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated sale ID
 *         customerId:
 *           type: integer
 *           description: ID of the customer
 *         itemId:
 *           type: integer
 *           description: ID of the item sold
 *         quantity:
 *           type: integer
 *           description: Quantity sold
 *         totalPrice:
 *           type: number
 *           format: float
 *           description: Total price of the sale
 *         saleDate:
 *           type: string
 *           format: date-time
 *           description: Date and time of the sale
 *       example:
 *         id: 1
 *         customerId: 5
 *         itemId: 3
 *         quantity: 10
 *         totalPrice: 150.00
 *         saleDate: "2025-07-07T14:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales management endpoints
 */

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - itemId
 *               - quantity
 *               - totalPrice
 *               - saleDate
 *             properties:
 *               customerId:
 *                 type: integer
 *               itemId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               totalPrice:
 *                 type: number
 *                 format: float
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *             example:
 *               customerId: 5
 *               itemId: 3
 *               quantity: 10
 *               totalPrice: 150.00
 *               saleDate: "2025-07-07T14:30:00Z"
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Invalid input
 */
router.post('/', salesController.createSale);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: List of sales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */
router.get('/', salesController.getAllSales);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get a sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 */
router.get('/:id', salesController.getSaleById);

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *               itemId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               totalPrice:
 *                 type: number
 *                 format: float
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *             example:
 *               customerId: 6
 *               itemId: 4
 *               quantity: 5
 *               totalPrice: 75.00
 *               saleDate: "2025-07-08T10:00:00Z"
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Sale not found
 */
router.put('/:id', salesController.updateSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete a sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sale ID
 *     responses:
 *       204:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 */
router.delete('/:id', salesController.deleteSale);

router.get('/report/sale-report', salesController.salesReport)

module.exports = router;

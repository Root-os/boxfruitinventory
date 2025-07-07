const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Purchase:
 *       type: object
 *       required:
 *         - customerId
 *         - itemId
 *         - quantity
 *         - totalPrice
 *         - unit
 *         - cost
 *         - purchaseDate
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated purchase ID
 *         customerId:
 *           type: integer
 *           description: ID of the customer making the purchase
 *         itemId:
 *           type: integer
 *           description: ID of the purchased item
 *         quantity:
 *           type: integer
 *           description: Quantity purchased
 *         totalPrice:
 *           type: number
 *           format: float
 *           description: Total price paid
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., pcs, kg)
 *         cost:
 *           type: number
 *           format: float
 *           description: Cost per unit
 *         description:
 *           type: string
 *           description: Additional purchase details (optional)
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Date of purchase
 *       example:
 *         id: 1
 *         customerId: 4
 *         itemId: 10
 *         quantity: 20
 *         totalPrice: 200.0
 *         unit: pcs
 *         cost: 10.0
 *         description: First bulk purchase
 *         purchaseDate: "2025-07-07T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Purchases
 *   description: Purchase management endpoints
 */

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Create a new purchase
 *     tags: [Purchases]
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
 *               - unit
 *               - cost
 *               - purchaseDate
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
 *               unit:
 *                 type: string
 *               cost:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *             example:
 *               customerId: 4
 *               itemId: 10
 *               quantity: 20
 *               totalPrice: 200.0
 *               unit: pcs
 *               cost: 10.0
 *               description: First bulk purchase
 *               purchaseDate: "2025-07-07T12:00:00Z"
 *     responses:
 *       201:
 *         description: Purchase created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Invalid input
 */
router.post('/', purchaseController.makePurchase);

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: Get all purchases
 *     tags: [Purchases]
 *     responses:
 *       200:
 *         description: List of purchases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Purchase'
 */
router.get('/', purchaseController.getAllPurchases);

module.exports = router;

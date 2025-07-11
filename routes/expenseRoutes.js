const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - amount
 *         - date
 *         - shopId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated expense ID
 *         name:
 *           type: string
 *           description: Name of the expense
 *         description:
 *           type: string
 *           description: Unique description of the expense
 *         amount:
 *           type: string
 *           description: Amount of the expense
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the expense
 *         shopId:
 *           type: integer
 *           description: ID of the shop associated with the expense
 *       example:
 *         id: 1
 *         name: Electricity Bill
 *         description: June electricity bill
 *         amount: "100.50"
 *         date: "2025-07-07"
 *         shopId: 3
 */

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management endpoints
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - amount
 *               - date
 *               - shopId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               shopId:
 *                 type: integer
 *             example:
 *               name: Electricity Bill
 *               description: June electricity bill
 *               amount: "100.50"
 *               date: "2025-07-07"
 *               shopId: 3
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid input
 */
router.post('/', expenseController.createExpense);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 */
router.get('/', expenseController.getAllExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 */
router.get('/:id', expenseController.getExpenseById);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Expense ID
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
 *               amount:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               shopId:
 *                 type: integer
 *             example:
 *               name: Updated Electricity Bill
 *               description: Updated June electricity bill
 *               amount: "110.00"
 *               date: "2025-07-08"
 *               shopId: 3
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Expense not found
 */
router.put('/:id', expenseController.updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Expense ID
 *     responses:
 *       204:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;

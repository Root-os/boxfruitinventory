const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');


router.post('/', salesController.createSale);
router.get('/', salesController.getAllSales);
router.get('/summary', salesController.getSalesByPaymentMethod);
router.get('/:id', salesController.getSaleById);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);
router.post('/report/sale-report', salesController.salesReport)

router.post('/report/salesman-report/:id', salesController.getSalesReportForSalesMan)
module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create, cancel } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isInt().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('paymentMethod').isIn(['CASH', 'UPI', 'CARD']).withMessage('Invalid payment method'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal is required'),
  body('gst').isFloat({ min: 0 }).withMessage('GST is required'),
  body('total').isFloat({ min: 0 }).withMessage('Total is required'),
];

router.use(auth);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validate(orderValidation), create);
router.patch('/:id/cancel', cancel);

module.exports = router;

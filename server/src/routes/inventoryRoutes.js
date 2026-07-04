const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create, update, updateStock, getHistory, remove } = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const inventoryValidation = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
];

const stockValidation = [
  body('action').isIn(['ADD', 'REMOVE', 'ADJUST']).withMessage('Invalid action'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

router.use(auth);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validate(inventoryValidation), create);
router.put('/:id', validate(inventoryValidation), update);
router.patch('/:id/stock', validate(stockValidation), updateStock);
router.get('/:id/history', getHistory);
router.delete('/:id', remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create, update, remove, getForPOS } = require('../controllers/productController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

router.use(auth);
router.get('/pos', getForPOS);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', upload.single('image'), validate(productValidation), create);
router.put('/:id', upload.single('image'), update);
router.delete('/:id', remove);

module.exports = router;

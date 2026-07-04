const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create, update, remove } = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

router.use(auth);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validate(categoryValidation), create);
router.put('/:id', validate(categoryValidation), update);
router.delete('/:id', remove);

module.exports = router;

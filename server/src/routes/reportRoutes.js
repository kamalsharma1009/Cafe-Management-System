const express = require('express');
const router = express.Router();
const { getReport, exportExcel } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', getReport);
router.get('/export', exportExcel);

module.exports = router;

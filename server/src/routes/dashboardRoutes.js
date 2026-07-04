const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', getStats);

module.exports = router;

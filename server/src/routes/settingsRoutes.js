const express = require('express');
const router = express.Router();
const { get, update } = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);
router.get('/', get);
router.put('/', upload.single('logo'), update);

module.exports = router;

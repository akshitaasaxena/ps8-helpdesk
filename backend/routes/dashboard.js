const express = require('express');
const router = express.Router();
const authHandler = require('../middleware/authhandler');
const allowRoles = require('../middleware/allowrules');
const { getDashboard } = require('../controllers/dashboardController');
router.get('/', authHandler, allowRoles, getDashboard);
router.get('/dashboard', authHandler, allowRoles, getDashboard);
module.exports = router;
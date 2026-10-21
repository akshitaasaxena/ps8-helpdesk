const express = require('express');
const router = express.Router();
const authHandler = require('../middleware/authhandler');
const { register, login, getMe } = require('../controllers/authcontroller');
router.post('/register', register);
router.post('/login', login);
router.get('/me', authHandler, getMe);
module.exports = router;

const express = require('express');
const router = express.Router();
const authHandler = require('../middleware/authhandler');
const allowRoles = require('../middleware/allowrules');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
router.get('/', authHandler, getDepartments);
router.post('/', authHandler, allowRoles, createDepartment);
router.put('/:id', authHandler, allowRoles, updateDepartment);
router.delete('/:id', authHandler, allowRoles, deleteDepartment);
module.exports = router;

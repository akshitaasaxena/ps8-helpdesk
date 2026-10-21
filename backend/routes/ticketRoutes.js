const express = require('express');
const router = express.Router();
const authHandler = require('../middleware/authhandler');
const allowRoles = require('../middleware/allowrules');
const {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  updateStatus,
  assignDepartment,
  reopenTicket
} = require('../controllers/ticketController');
const {
  getComments,
  addComment
} = require('../controllers/commentController');
router.get('/', authHandler, getTickets);
router.post('/', authHandler, createTicket);
router.get('/:id', authHandler, getTicketById);
router.put('/:id', authHandler, updateTicket);
router.patch('/:id/status', authHandler, allowRoles, updateStatus);
router.patch('/:id/assign', authHandler, allowRoles, assignDepartment);
router.post('/:id/reopen', authHandler, reopenTicket);
router.get('/:id/comments', authHandler, getComments);
router.post('/:id/comments', authHandler, addComment);
module.exports = router;

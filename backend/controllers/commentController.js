const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Ticket = require('../models/ticket');
const findTicket = async (idParam) => {
  if (mongoose.isValidObjectId(idParam)) {
    return await Ticket.findById(idParam);
  }
  return await Ticket.findOne({ ticketId: idParam });
};
const getComments = async (req, res) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role !== 'admin' && ticket.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const comments = await Comment.find({ ticket: ticket._id })
      .populate('user', 'name role email')
      .sort({ createdAt: 1 });
    return res.json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addComment = async (req, res) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role !== 'admin' && ticket.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Comment message is required' });
    }
    const comment = await Comment.create({
      ticket: ticket._id,
      user: req.user.id,
      message: message.trim()
    });
    const populated = await Comment.findById(comment._id).populate('user', 'name role email');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = { getComments, addComment };

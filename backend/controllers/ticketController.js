const mongoose = require('mongoose');
const Ticket = require('../models/ticket');
const findTicketByIdOrCustomId = async (idParam) => {
  if (mongoose.isValidObjectId(idParam)) {
    return await Ticket.findById(idParam).populate('customer', 'name email role').populate('department', 'name description');
  }
  return await Ticket.findOne({ ticketId: idParam }).populate('customer', 'name email role').populate('department', 'name description');
};
const getTickets = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.customer = req.user.id;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }
    const tickets = await Ticket.find(filter)
      .populate('customer', 'name email role')
      .populate('department', 'name description')
      .sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const createTicket = async (req, res) => {
  try {
    const { title, category, priority, description, screenshotUrl } = req.body;
    if (!title || !category || !priority || !description) {
      return res.status(400).json({ message: 'Title, category, priority, and description are required' });
    }
    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be Low, Medium, or High' });
    }
    const count = await Ticket.countDocuments();
    let num = 1000 + count + 1;
    let ticketId = `TKT-${num}`;
    while (await Ticket.findOne({ ticketId })) {
      num += 1;
      ticketId = `TKT-${num}`;
    }
    const ticket = await Ticket.create({
      ticketId,
      title: title.trim(),
      category: category.trim(),
      priority,
      description: description.trim(),
      screenshotUrl: screenshotUrl ? screenshotUrl.trim() : '',
      status: 'Open',
      customer: req.user.id,
      department: null,
      reopenCount: 0
    });
    const populated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email role')
      .populate('department', 'name description');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getTicketById = async (req, res) => {
  try {
    const ticket = await findTicketByIdOrCustomId(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role !== 'admin' && ticket.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateTicket = async (req, res) => {
  try {
    const ticket = await findTicketByIdOrCustomId(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isOwner = ticket.customer._id.toString() === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!isAdmin) {
      if (ticket.status === 'Closed') {
        return res.status(400).json({ message: 'Closed tickets cannot be edited' });
      }
      if (ticket.status === 'Resolved') {
        return res.status(400).json({ message: 'Resolved tickets cannot be edited' });
      }
    }
    const { title, category, priority, description, screenshotUrl, status, department } = req.body;
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Title cannot be empty' });
      ticket.title = title.trim();
    }
    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json({ message: 'Category cannot be empty' });
      ticket.category = category.trim();
    }
    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({ message: 'Priority must be Low, Medium, or High' });
      }
      ticket.priority = priority;
    }
    if (description !== undefined) {
      if (!description.trim()) return res.status(400).json({ message: 'Description cannot be empty' });
      ticket.description = description.trim();
    }
    if (screenshotUrl !== undefined) {
      ticket.screenshotUrl = screenshotUrl ? screenshotUrl.trim() : '';
    }
    if (isAdmin) {
      if (status !== undefined) {
        if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        ticket.status = status;
      }
      if (department !== undefined) {
        ticket.department = department ? department : null;
      }
    }
    await ticket.save();
    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email role')
      .populate('department', 'name description');
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const ticket = await findTicketByIdOrCustomId(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    ticket.status = status;
    await ticket.save();
    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email role')
      .populate('department', 'name description');
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const assignDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    const ticket = await findTicketByIdOrCustomId(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    ticket.department = department ? department : null;
    await ticket.save();
    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email role')
      .populate('department', 'name description');
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const reopenTicket = async (req, res) => {
  try {
    const ticket = await findTicketByIdOrCustomId(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role !== 'admin' && ticket.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (ticket.status !== 'Resolved') {
      return res.status(400).json({ message: 'Only resolved tickets can be reopened' });
    }
    if (ticket.reopenCount >= 1) {
      return res.status(400).json({ message: 'A resolved ticket can be reopened only once' });
    }
    ticket.status = 'Open';
    ticket.reopenCount = (ticket.reopenCount || 0) + 1;
    await ticket.save();
    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email role')
      .populate('department', 'name description');
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  updateStatus,
  assignDepartment,
  reopenTicket
};

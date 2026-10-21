const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  description: { type: String, required: true },
  screenshotUrl: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  reopenCount: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Ticket', ticketSchema);

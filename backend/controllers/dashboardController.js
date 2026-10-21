const Ticket = require('../models/ticket');
const Department = require('../models/department');
const User = require('../models/user');
const getDashboard = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'Closed' });
    const lowPriority = await Ticket.countDocuments({ priority: 'Low' });
    const mediumPriority = await Ticket.countDocuments({ priority: 'Medium' });
    const highPriority = await Ticket.countDocuments({ priority: 'High' });
    const totalDepartments = await Department.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const resolvedOrClosedList = await Ticket.find({
      status: { $in: ['Resolved', 'Closed'] }
    }).select('createdAt updatedAt');
    let avgResolutionHours = 0;
    if (resolvedOrClosedList.length > 0) {
      const totalTimeMs = resolvedOrClosedList.reduce((acc, t) => {
        const diff = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      avgResolutionHours = Number((totalTimeMs / (resolvedOrClosedList.length * 1000 * 60 * 60)).toFixed(1));
    }
    return res.json({
      totalTickets,
      byStatus: {
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets
      },
      byPriority: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority
      },
      resolution: {
        resolvedCount: resolvedTickets + closedTickets,
        avgResolutionHours
      },
      totalDepartments,
      totalCustomers
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = { getDashboard };

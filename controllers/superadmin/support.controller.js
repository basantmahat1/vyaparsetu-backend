const { SupportTicket, User, ActivityLog } = require('../../models');
const { sendResponse, sendError } = require('../../utils/response');
const { Op } = require('sequelize');

// SUPPORT TICKET MANAGEMENT
const getSupportTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tickets = await SupportTicket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] }
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Support tickets retrieved', {
      data: tickets.rows,
      pagination: {
        total: tickets.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(tickets.count / limit)
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    sendError(res, 500, 'Failed to get support tickets', error);
  }
};

const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedUserId } = req.body;

    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    await ticket.update({
      assignedTo: assignedUserId,
      status: 'in-progress'
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: `Assigned ticket to staff`,
      actionType: 'update',
      resource: 'SupportTicket',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Ticket assigned successfully', ticket);
  } catch (error) {
    console.error('Assign ticket error:', error);
    sendError(res, 500, 'Failed to assign ticket', error);
  }
};

const resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { resolution } = req.body;

    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    await ticket.update({
      status: 'resolved',
      resolvedAt: new Date()
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: `Resolved ticket: ${resolution}`,
      actionType: 'update',
      resource: 'SupportTicket',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Ticket resolved successfully', ticket);
  } catch (error) {
    console.error('Resolve ticket error:', error);
    sendError(res, 500, 'Failed to resolve ticket', error);
  }
};

module.exports = {
  getSupportTickets,
  assignTicket,
  resolveTicket
};
import { db } from '../db/database.js';
import { telegramBot } from '../bot/telegramBot.js';

export const ticketsController = {
  getAll(req, res) {
    const { projectId, status } = req.query;
    let list = db.getCollection('tickets');

    if (projectId) {
      list = list.filter(t => t.projectId === projectId);
    }
    if (status) {
      list = list.filter(t => t.status === status);
    }

    // Enrich with project details
    const enriched = list.map(t => {
      const project = db.findById('projects', t.projectId);
      return {
        ...t,
        projectName: project ? project.name : 'Общий / Не указан'
      };
    });

    res.json({ success: true, tickets: enriched });
  },

  getById(req, res) {
    const ticket = db.findById('tickets', req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Тикет не найден' });
    }
    const project = db.findById('projects', ticket.projectId);
    res.json({ success: true, ticket: { ...ticket, projectName: project ? project.name : '' } });
  },

  async create(req, res) {
    const { projectId, clientName, clientContact, message, priority } = req.body;
    if (!message || !clientName) {
      return res.status(400).json({ success: false, error: 'Имя клиента и сообщение обязательны' });
    }

    const project = projectId ? db.findById('projects', projectId) : null;

    const newTicket = db.insert('tickets', {
      projectId: projectId || '',
      clientName,
      clientContact: clientContact || '',
      message,
      status: 'new',
      priority: priority || 'normal'
    });

    db.addLog({
      type: 'ticket_created',
      ticketId: newTicket.id,
      client: clientName,
      project: project ? project.name : 'Unknown'
    });

    // Send rich instant push notification to Telegram bot!
    await telegramBot.notifySupportTicket(newTicket, project);

    res.status(201).json({
      success: true,
      ticket: newTicket,
      message: 'Запрос поддержки успешно отправлен и передан в Telegram!'
    });
  },

  updateStatus(req, res) {
    const { status } = req.body;
    const valid = ['new', 'in_progress', 'resolved'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, error: 'Некорректный статус' });
    }

    const ticket = db.findById('tickets', req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Тикет не найден' });
    }

    const updated = db.update('tickets', req.params.id, { status });
    db.addLog({ type: 'ticket_status_changed', ticketId: ticket.id, status });
    res.json({ success: true, ticket: updated });
  },

  delete(req, res) {
    const deleted = db.delete('tickets', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Тикет не найден' });
    }
    res.json({ success: true, message: 'Тикет удален' });
  }
};

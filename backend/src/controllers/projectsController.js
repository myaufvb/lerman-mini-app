import { db } from '../db/database.js';
import { monitorService } from '../services/monitorService.js';
import crypto from 'crypto';

export const projectsController = {
  getAll(req, res) {
    const projects = db.getCollection('projects');
    res.json({ success: true, projects });
  },

  getById(req, res) {
    const project = db.findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Проект не найден' });
    }
    res.json({ success: true, project });
  },

  create(req, res) {
    const { name, description, url, version } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Имя проекта обязательно' });
    }

    const newProject = db.insert('projects', {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description || '',
      url: url || '',
      status: 'online',
      latencyMs: 0,
      lastChecked: null,
      version: version || '1.0.0',
      apiKey: `lerman_live_${crypto.randomBytes(16).toString('hex')}`
    });

    // Check uptime immediately if url is provided
    if (newProject.url) {
      monitorService.checkProject(newProject);
    }

    db.addLog({ type: 'project_created', projectId: newProject.id, name: newProject.name });
    res.status(201).json({ success: true, project: newProject });
  },

  update(req, res) {
    const project = db.findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Проект не найден' });
    }

    const updated = db.update('projects', req.params.id, req.body);
    res.json({ success: true, project: updated });
  },

  delete(req, res) {
    const deleted = db.delete('projects', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Проект не найден' });
    }
    // Also cleanup credentials, tickets and media associated with this project
    const creds = db.find('credentials', c => c.projectId === req.params.id);
    creds.forEach(c => db.delete('credentials', c.id));

    res.json({ success: true, message: 'Проект и связанные ресурсы удалены' });
  },

  async ping(req, res) {
    const project = db.findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Проект не найден' });
    }

    const updated = await monitorService.checkProject(project);
    res.json({ success: true, project: updated });
  }
};

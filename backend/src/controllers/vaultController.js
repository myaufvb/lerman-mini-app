import { db } from '../db/database.js';
import { cryptoService } from '../services/cryptoService.js';

export const vaultController = {
  getAll(req, res) {
    const { projectId } = req.query;
    let list = db.getCollection('credentials');

    if (projectId) {
      list = list.filter(c => c.projectId === projectId);
    }

    // Decrypt passwords for the authorized Mini App session
    const decryptedList = list.map(c => {
      let plainPassword = '';
      if (c.passwordEncrypted && c.iv && c.authTag) {
        plainPassword = cryptoService.decrypt(c.passwordEncrypted, c.iv, c.authTag);
      } else if (c.password) {
        plainPassword = c.password;
      }
      return {
        ...c,
        password: plainPassword
      };
    });

    res.json({ success: true, credentials: decryptedList });
  },

  create(req, res) {
    const { projectId, title, login, password, url, category, notes } = req.body;
    if (!title || !login) {
      return res.status(400).json({ success: false, error: 'Название и логин обязательны' });
    }

    const enc = cryptoService.encrypt(password || '');

    const newCred = db.insert('credentials', {
      projectId: projectId || '',
      title,
      login,
      passwordEncrypted: enc.cipherText,
      iv: enc.iv,
      authTag: enc.authTag,
      url: url || '',
      category: category || 'general',
      notes: notes || ''
    });

    db.addLog({ type: 'vault_add', title: newCred.title, projectId });
    res.status(201).json({
      success: true,
      credential: {
        ...newCred,
        password: password || ''
      }
    });
  },

  update(req, res) {
    const cred = db.findById('credentials', req.params.id);
    if (!cred) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    const { title, login, password, url, category, notes, projectId } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (login !== undefined) updates.login = login;
    if (url !== undefined) updates.url = url;
    if (category !== undefined) updates.category = category;
    if (notes !== undefined) updates.notes = notes;
    if (projectId !== undefined) updates.projectId = projectId;

    if (password !== undefined) {
      const enc = cryptoService.encrypt(password);
      updates.passwordEncrypted = enc.cipherText;
      updates.iv = enc.iv;
      updates.authTag = enc.authTag;
    }

    const updated = db.update('credentials', req.params.id, updates);
    res.json({
      success: true,
      credential: {
        ...updated,
        password: password !== undefined ? password : cryptoService.decrypt(updated.passwordEncrypted, updated.iv, updated.authTag)
      }
    });
  },

  delete(req, res) {
    const deleted = db.delete('credentials', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }
    db.addLog({ type: 'vault_delete', id: req.params.id });
    res.json({ success: true, message: 'Запись успешно удалена' });
  }
};

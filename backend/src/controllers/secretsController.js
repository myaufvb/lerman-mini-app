import crypto from 'crypto';
import { db } from '../db/database.js';
import { cryptoService } from '../services/cryptoService.js';

export const secretsController = {
  create(req, res) {
    const { content, burnAfterRead = true, ttlMinutes = 60, title = 'Конфиденциальный пароль' } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Содержимое секрета обязательно' });
    }

    const enc = cryptoService.encrypt(content);
    const secretId = crypto.randomBytes(12).toString('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    db.insert('secrets', {
      id: secretId,
      title,
      cipherText: enc.cipherText,
      iv: enc.iv,
      authTag: enc.authTag,
      burnAfterRead: Boolean(burnAfterRead),
      expiresAt,
      isBurned: false,
      viewedAt: null
    });

    db.addLog({ type: 'secret_created', secretId, title });
    res.status(201).json({
      success: true,
      secretId,
      expiresAt,
      message: 'Одноразовый секрет успешно сгенерирован'
    });
  },

  getAndBurn(req, res) {
    const { id } = req.params;
    const secret = db.findById('secrets', id);

    if (!secret) {
      return res.status(404).json({
        success: false,
        error: 'Секрет не найден или уже был уничтожен (сгорел после прочтения)'
      });
    }

    // Check expiration
    if (new Date() > new Date(secret.expiresAt) || secret.isBurned) {
      db.delete('secrets', id);
      return res.status(410).json({
        success: false,
        error: 'Срок действия секрета истек либо он уже был просмотрен и самоуничтожился'
      });
    }

    const decryptedContent = cryptoService.decrypt(secret.cipherText, secret.iv, secret.authTag);

    // If burn after read, delete or mark burned immediately
    if (secret.burnAfterRead) {
      db.delete('secrets', id);
      db.addLog({ type: 'secret_burned', secretId: id });
    } else {
      db.update('secrets', id, { isBurned: true, viewedAt: new Date().toISOString() });
    }

    res.json({
      success: true,
      title: secret.title,
      content: decryptedContent,
      burned: secret.burnAfterRead
    });
  }
};

import { db } from '../db/database.js';
import { config } from '../config.js';
import { telegramBot } from '../bot/telegramBot.js';
import crypto from 'crypto';

export const pendingAuthSessions = new Map(); // sessionId -> { code, user, expiresAt, approved, token, targetChatId }

export const authController = {
  getPendingSession(id) {
    return pendingAuthSessions.get(id);
  },

  approveSession(id) {
    const session = pendingAuthSessions.get(id);
    if (session) {
      session.approved = true;
      return session;
    }
    return null;
  },

  rejectSession(id) {
    const session = pendingAuthSessions.get(id);
    if (session) {
      pendingAuthSessions.delete(id);
      return true;
    }
    return false;
  },

  async login(req, res) {
    const { login, password, isInsideTelegram } = req.body;
    if (!login || !password) {
      return res.status(400).json({ success: false, error: 'Введите логин и пароль' });
    }

    const cleanLogin = login.trim().toLowerCase();
    const cleanPhone = login.trim().replace(/[^0-9+]/g, '');

    const users = db.getCollection('users') || [];
    const user = users.find(u => 
      u.login?.toLowerCase() === cleanLogin ||
      u.phone === cleanLogin ||
      (cleanPhone && u.phone?.replace(/[^0-9+]/g, '') === cleanPhone)
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден. Проверьте логин или номер телефона.' });
    }

    // Password check if provided
    if (password && user.password !== password.trim()) {
      return res.status(401).json({ success: false, error: 'Неверный пароль' });
    }

    const userRole = user.role || (user.login?.toLowerCase() === 'lerman_dev' || user.login === 'admin' ? 'developer' : 'user');
    const token = `lerman_sess_${crypto.randomBytes(16).toString('hex')}`;
    const userData = {
      id: user.id,
      name: user.name,
      login: user.login,
      phone: user.phone,
      role: userRole,
      telegramId: user.telegramId
    };

    // --- ALWAYS REQUIRE TELEGRAM CONFIRMATION CODE FOR WEB LOGIN ---
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const authSessionId = `auth_sess_${crypto.randomBytes(12).toString('hex')}`;
    
    // Find target Telegram Chat ID: user's chat or admin chat
    const targetChatId = user.telegramId || db.getSettings()?.adminChatId || config.adminChatId;

    pendingAuthSessions.set(authSessionId, {
      code,
      user: userData,
      token,
      targetChatId,
      expiresAt: Date.now() + 5 * 60 * 1000,
      approved: false
    });

    if (targetChatId) {
      await telegramBot.sendAuthConfirmation(targetChatId, {
        authSessionId,
        code,
        username: user.login,
        role: userRole
      });
    }

    return res.json({
      success: true,
      requireTelegramConfirmation: true,
      authSessionId,
      hasTelegramLinked: !!targetChatId,
      message: targetChatId 
        ? 'В ваш Telegram отправлен код подтверждения и кнопка разрешения входа'
        : 'Бот не подключен к аккаунту. Отправьте /start боту @Lerman_logic_bot'
    });
  },

  verifyTelegram(req, res) {
    const { authSessionId, code } = req.body;
    if (!authSessionId) {
      return res.status(400).json({ success: false, error: 'Отсутствует ID сессии' });
    }

    const session = pendingAuthSessions.get(authSessionId);
    if (!session) {
      return res.status(400).json({ success: false, error: 'Сессия подтверждения истекла. Попробуйте войти снова.' });
    }

    if (Date.now() > session.expiresAt) {
      pendingAuthSessions.delete(authSessionId);
      return res.status(400).json({ success: false, error: 'Код подтверждения истек. Запросите новый.' });
    }

    const enteredCode = (code || '').trim();
    if (session.approved || session.code === enteredCode) {
      pendingAuthSessions.delete(authSessionId);
      return res.json({
        success: true,
        token: session.token,
        user: session.user
      });
    }

    return res.status(400).json({ success: false, error: 'Неверный код подтверждения' });
  },

  checkStatus(req, res) {
    const { authSessionId } = req.query;
    if (!authSessionId) {
      return res.status(400).json({ success: false, error: 'Сессия не указана' });
    }

    const session = pendingAuthSessions.get(authSessionId);
    if (!session) {
      return res.json({ success: false, approved: false, expired: true });
    }

    if (Date.now() > session.expiresAt) {
      pendingAuthSessions.delete(authSessionId);
      return res.json({ success: false, approved: false, expired: true });
    }

    if (session.approved) {
      pendingAuthSessions.delete(authSessionId);
      return res.json({
        success: true,
        approved: true,
        token: session.token,
        user: session.user
      });
    }

    return res.json({ success: true, approved: false });
  },

  async resendCode(req, res) {
    const { authSessionId } = req.body;
    const session = pendingAuthSessions.get(authSessionId);
    if (!session) {
      return res.status(400).json({ success: false, error: 'Сессия не найдена' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    session.code = newCode;
    session.expiresAt = Date.now() + 5 * 60 * 1000;

    const targetChatId = session.targetChatId || db.getSettings()?.adminChatId || config.adminChatId;
    if (targetChatId) {
      await telegramBot.sendAuthConfirmation(targetChatId, {
        authSessionId,
        code: newCode,
        username: session.user.login,
        role: session.user.role
      });
      return res.json({ success: true, message: 'Новый код отправлен в Telegram' });
    } else {
      return res.status(400).json({ success: false, error: 'Telegram аккаунт не привязан к боту' });
    }
  },

  register(req, res) {
    const { login, password, phone, name } = req.body;
    if (!login || !password) {
      return res.status(400).json({ success: false, error: 'Логин и пароль обязательны' });
    }

    const cleanLogin = login.trim().toLowerCase();
    const users = db.getCollection('users') || [];

    if (users.some(u => u.login?.toLowerCase() === cleanLogin)) {
      return res.status(400).json({ success: false, error: 'Пользователь с таким логином уже существует' });
    }

    const newUser = db.insert('users', {
      login: cleanLogin,
      password: password.trim(),
      phone: phone ? phone.trim() : '',
      name: name ? name.trim() : cleanLogin,
      role: 'user', // regular user by default
      telegramId: ''
    });

    const token = `lerman_sess_${crypto.randomBytes(16).toString('hex')}`;
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        login: newUser.login,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  }
};

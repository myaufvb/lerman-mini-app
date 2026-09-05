import { db } from '../db/database.js';
import crypto from 'crypto';

export const authController = {
  login(req, res) {
    const { login, password } = req.body;
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

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }

    const token = `lerman_sess_${crypto.randomBytes(16).toString('hex')}`;
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        phone: user.phone,
        telegramId: user.telegramId
      }
    });
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
        phone: newUser.phone
      }
    });
  }
};

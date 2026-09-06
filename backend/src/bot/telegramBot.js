import { Telegraf, Markup } from 'telegraf';
import { config } from '../config.js';
import { db } from '../db/database.js';
import { pendingAuthSessions } from '../controllers/authController.js';

class TelegramBotManager {
  constructor() {
    this.bot = null;
    this.adminChatId = config.adminChatId || db.getSettings()?.adminChatId || '';
    this.appUrl = config.appUrl;
    this.userStates = new Map(); // chatId -> { step, phone, name }
    this.init();
  }

  init() {
    if (!config.botToken) {
      console.log('ℹ️ [TELEGRAM BOT] Токен бота не указан в .env. Бот работает в режиме эмуляции.');
      return;
    }

    try {
      this.bot = new Telegraf(config.botToken);

      // 1. Command /start
      this.bot.start((ctx) => {
        const chatId = ctx.chat.id;
        console.log(`👤 Пользователь запустил бота. Chat ID: ${chatId}`);

        // Auto-set adminChatId
        this.adminChatId = chatId.toString();
        db.updateSettings({ adminChatId: this.adminChatId });

        this.userStates.delete(chatId);

        const miniAppUrl = this.appUrl;

        ctx.reply(
          `🛡️ *Добро пожаловать в Lerman Cyber Monitor & Mini App!*\n\n` +
          `Центр управления вашими проектами, зашифрованным хранилищем паролей, фото/видео и поддержкой клиентов.\n\n` +
          `🔐 *Для входа в Mini App введите данные учетной записи или зарегистрируйтесь:*`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback('🔑 Войти', 'flow_login'),
                Markup.button.callback('📝 Зарегистрироваться', 'flow_register')
              ],
              [Markup.button.webApp('🚀 Открыть Lerman Mini App', miniAppUrl)],
              [Markup.button.callback('📊 Статус систем', 'cmd_status')]
            ])
          }
        );
      });

      // 2. Action: Register flow
      this.bot.action('flow_register', async (ctx) => {
        const chatId = ctx.chat.id;
        this.userStates.set(chatId, { step: 'REG_CONTACT' });
        await ctx.answerCbQuery();

        await ctx.reply(
          `📱 *Шаг 1 из 2: Подтверждение номера*\n\n` +
          `Для быстрой регистрации нажмите большую кнопку внизу экрана:\n` +
          `👉 *«📱 Поделиться контактом»*\n\n` +
          `_Ваш номер будет использоваться как логин для входа в Mini App._`,
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([
              [Markup.button.contactRequest('📱 Поделиться контактом')]
            ]).resize().oneTime()
          }
        );
      });

      // 3. Action: Login flow
      this.bot.action('flow_login', async (ctx) => {
        const chatId = ctx.chat.id;
        this.userStates.set(chatId, { step: 'LOGIN_WAIT' });
        await ctx.answerCbQuery();

        await ctx.reply(
          `🔑 *Вход в систему Lerman Mini App*\n\n` +
          `Выберите удобный для вас способ:\n\n` +
          `1️⃣ Нажмите кнопку *«📱 Прислать номер»* внизу — бот автоматически найдет ваш аккаунт и пришлет ваш логин и пароль.\n\n` +
          `2️⃣ Либо отправьте ваш *Логин* и *Пароль* прямо сюда в чат через пробел (например: \`admin 12345\`).`,
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([
              [Markup.button.contactRequest('📱 Прислать номер')]
            ]).resize().oneTime()
          }
        );
      });

      // 4. Contact handler (User shares phone)
      this.bot.on('contact', async (ctx) => {
        const chatId = ctx.chat.id;
        const contact = ctx.message.contact;
        let phone = contact.phone_number;
        if (!phone.startsWith('+')) phone = '+' + phone;

        const state = this.userStates.get(chatId) || { step: 'LOGIN_WAIT' };
        const users = db.getCollection('users') || [];
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        // 🌟 Check if Developer (+998334906969)
        if (cleanPhone.endsWith('998334906969')) {
          this.adminChatId = chatId.toString();
          db.updateSettings({ adminChatId: this.adminChatId });

          let devUser = users.find(u => 
            u.login?.toLowerCase() === 'lerman_dev' || 
            (u.phone && u.phone.replace(/[^0-9]/g, '').endsWith('998334906969'))
          );

          if (devUser) {
            db.update('users', devUser.id, {
              login: 'Lerman_dev',
              password: '2010090900',
              phone: '+998334906969',
              role: 'developer',
              telegramId: chatId.toString()
            });
          } else {
            db.insert('users', {
              login: 'Lerman_dev',
              password: '2010090900',
              phone: '+998334906969',
              name: 'Lerman (Разработчик)',
              role: 'developer',
              telegramId: chatId.toString()
            });
          }

          this.userStates.delete(chatId);
          return ctx.reply(
            `⚡ *ВЕРИФИКАЦИЯ РАЗРАБОТЧИКА УСПЕШНА!*\n\n` +
            `Номер *+998334906969* подтвержден.\n` +
            `Вам выдан персональный root-доступ со статусом *Разработчик*.\n\n` +
            `📋 *Ваши данные для входа в Lerman Mini App:*\n` +
            `👤 *Логин:* \`Lerman_dev\`\n` +
            `🔑 *Пароль:* \`2010090900\`\n` +
            `🏷️ *Статус:* \`⚡ Разработчик (Root Developer)\`\n\n` +
            `Скопируйте их, откройте Mini App и вставьте во вкладке *«Вход»*:`,
            {
              parse_mode: 'Markdown',
              ...Markup.removeKeyboard(),
              ...Markup.inlineKeyboard([
                [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
              ])
            }
          );
        }

        // Check if registration flow for ordinary user
        if (state.step === 'REG_CONTACT') {
          // Check if already registered
          const existing = users.find(u => u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone);
          if (existing) {
            this.userStates.delete(chatId);
            return ctx.reply(
              `ℹ️ *Вы уже зарегистрированы в системе!*\n\n` +
              `👤 *Логин:* \`${existing.login}\`\n` +
              `🔑 *Пароль:* \`${existing.password}\`\n\n` +
              `Скопируйте их и вставьте во вкладке *«Вход»* в приложении:`,
              {
                parse_mode: 'Markdown',
                ...Markup.removeKeyboard(),
                ...Markup.inlineKeyboard([
                  [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
                ])
              }
            );
          }

          // Move to Step 2: Ask for password
          this.userStates.set(chatId, {
            step: 'REG_PASSWORD',
            phone,
            name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Пользователь'
          });

          return ctx.reply(
            `✅ *Номер ${phone} успешно подтвержден!*\n\n` +
            `🔒 *Шаг 2 из 2:* Теперь придумайте и напишите сюда в чат *пароль* для входа:`,
            {
              parse_mode: 'Markdown',
              ...Markup.removeKeyboard()
            }
          );
        }

        // Otherwise it's Login flow (or user sent contact)
        const foundUser = users.find(u => u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone);
        this.userStates.delete(chatId);

        if (foundUser) {
          return ctx.reply(
            `✅ *Ваш аккаунт успешно найден!*\n\n` +
            `Ваши данные для входа в Lerman Mini App:\n` +
            `👤 *Логин:* \`${foundUser.login}\`\n` +
            `🔑 *Пароль:* \`${foundUser.password}\`\n\n` +
            `_Скопируйте их и вставьте во вкладке «Вход» в приложении:_`,
            {
              parse_mode: 'Markdown',
              ...Markup.removeKeyboard(),
              ...Markup.inlineKeyboard([
                [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
              ])
            }
          );
        } else {
          return ctx.reply(
            `❌ *Пользователь с номером ${phone} не найден.*\n\n` +
            `Хотите пройти быструю регистрацию прямо сейчас?`,
            {
              parse_mode: 'Markdown',
              ...Markup.removeKeyboard(),
              ...Markup.inlineKeyboard([
                [Markup.button.callback('📝 Зарегистрироваться', 'flow_register')]
              ])
            }
          );
        }
      });

      // 5. Text message handler (Password input or Login via text)
      this.bot.on('text', async (ctx, next) => {
        const text = ctx.message.text.trim();
        const chatId = ctx.chat.id;

        // Skip commands
        if (text.startsWith('/')) {
          return next();
        }

        const state = this.userStates.get(chatId);

        // A) User is entering password for registration
        if (state && state.step === 'REG_PASSWORD') {
          const password = text;
          const phone = state.phone;
          const login = phone; // Login is phone number
          const isDev = (chatId.toString() === this.adminChatId?.toString());
          const role = isDev ? 'developer' : 'user';

          db.insert('users', {
            login,
            phone,
            password,
            name: state.name || ctx.from.first_name || 'Пользователь',
            role,
            telegramId: chatId.toString()
          });

          this.userStates.delete(chatId);

          const roleBadge = role === 'developer' ? '⚡ Разработчик (Full Access)' : '👤 Пользователь';

          return ctx.reply(
            `🎉 *Регистрация успешно завершена!*\n\n` +
            `Ваши персональные данные для входа:\n` +
            `👤 *Логин:* \`${login}\`\n` +
            `🔑 *Пароль:* \`${password}\`\n` +
            `🏷️ *Статус:* ${roleBadge}\n\n` +
            `Нажмите кнопку ниже, чтобы открыть Mini App и ввести эти данные во вкладке *«Вход»*:`,
            {
              parse_mode: 'Markdown',
              ...Markup.inlineKeyboard([
                [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
              ])
            }
          );
        }

        // B) User typed login and password in chat (e.g. "admin 12345")
        if (state && state.step === 'LOGIN_WAIT') {
          const parts = text.split(/\s+/);
          if (parts.length >= 2) {
            const [enteredLogin, enteredPass] = parts;
            const users = db.getCollection('users') || [];
            const user = users.find(u => 
              (u.login?.toLowerCase() === enteredLogin.toLowerCase() || u.phone === enteredLogin) &&
              u.password === enteredPass
            );

            this.userStates.delete(chatId);

            if (user) {
              return ctx.reply(
                `✅ *Авторизация успешна!*\n\n` +
                `👤 *Логин:* \`${user.login}\`\n` +
                `🔑 *Пароль:* \`${user.password}\`\n\n` +
                `Используйте их для входа в Mini App:`,
                {
                  parse_mode: 'Markdown',
                  ...Markup.removeKeyboard(),
                  ...Markup.inlineKeyboard([
                    [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
                  ])
                }
              );
            } else {
              return ctx.reply(
                `❌ Неверный логин или пароль.\n\nПопробуйте снова или зарегистрируйтесь:`,
                {
                  parse_mode: 'Markdown',
                  ...Markup.inlineKeyboard([
                    [Markup.button.callback('📝 Зарегистрироваться', 'flow_register')]
                  ])
                }
              );
            }
          }
        }

        return next();
      });

      // Commands
      this.bot.command('status', (ctx) => this.handleStatusCommand(ctx));
      this.bot.action('cmd_status', (ctx) => this.handleStatusCommand(ctx));
      this.bot.command('dev', (ctx) => this.handleDevInfo(ctx));
      this.bot.action('cmd_dev_info', (ctx) => this.handleDevInfo(ctx));

      // 2FA Authorization actions for PC Login
      this.bot.action(/^auth_allow:(.+)$/, async (ctx) => {
        const authSessionId = ctx.match[1];
        const session = pendingAuthSessions.get(authSessionId);
        if (session) {
          session.approved = true;
          await ctx.answerCbQuery('Вход на ПК успешно разрешен! ✅');
          await ctx.editMessageText(
            `✅ *ВХОД НА ПК УСПЕШНО РАЗРЕШЕН!*\n\n` +
            `👤 Пользователь: *${session.user.login}*\n` +
            `🖥️ Статус: Сессия на ПК авторизована.\n` +
            `⏰ Время: ${new Date().toLocaleTimeString('ru-RU')}`,
            { parse_mode: 'Markdown' }
          );
        } else {
          await ctx.answerCbQuery('Сессия истекла или уже подтверждена');
        }
      });

      this.bot.action(/^auth_deny:(.+)$/, async (ctx) => {
        const authSessionId = ctx.match[1];
        pendingAuthSessions.delete(authSessionId);
        await ctx.answerCbQuery('Вход на ПК заблокирован! 🛑');
        await ctx.editMessageText(
          `🛑 *ВХОД НА ПК ОТКЛОНЕН!*\n\n` +
          `Попытка входа была заблокирована.`,
          { parse_mode: 'Markdown' }
        );
      });

      // Inline button handlers for Support Tickets
      this.bot.action(/^tkt_work:(.+)$/, async (ctx) => {
        const ticketId = ctx.match[1];
        const ticket = db.findById('tickets', ticketId);
        if (ticket) {
          db.update('tickets', ticketId, { status: 'in_progress' });
          await ctx.answerCbQuery('Тикет взят в работу! ⚡');
          await ctx.editMessageReplyMarkup({
            inline_keyboard: [
              [
                Markup.button.callback('✅ Отметить Решенным', `tkt_done:${ticketId}`),
                Markup.button.webApp('📱 Открыть в Mini App', this.appUrl)
              ]
            ]
          });
          db.addLog({ type: 'ticket_update', message: `Тикет ${ticketId} переведен в статус "В работе" через бота` });
        } else {
          await ctx.answerCbQuery('Тикет не найден');
        }
      });

      this.bot.action(/^tkt_done:(.+)$/, async (ctx) => {
        const ticketId = ctx.match[1];
        const ticket = db.findById('tickets', ticketId);
        if (ticket) {
          db.update('tickets', ticketId, { status: 'resolved' });
          await ctx.answerCbQuery('Тикет успешно закрыт! ✅');
          await ctx.editMessageReplyMarkup({
            inline_keyboard: [
              [Markup.button.webApp('📱 Открыть в Mini App', this.appUrl)]
            ]
          });
          db.addLog({ type: 'ticket_update', message: `Тикет ${ticketId} помечен как решенный через бота` });
        } else {
          await ctx.answerCbQuery('Тикет не найден');
        }
      });

      this.bot.launch()
        .then(() => console.log('🤖 Telegram-бот успешно запущен и слушает команды!'))
        .catch(err => console.error('Ошибка запуска Telegram-бота:', err.message));

      // Enable graceful stop
      process.once('SIGINT', () => this.bot?.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot?.stop('SIGTERM'));

    } catch (error) {
      console.error('Ошибка инициализации Telegraf:', error.message);
    }
  }

  handleStatusCommand(ctx) {
    const projects = db.getCollection('projects');
    const tickets = db.getCollection('tickets');
    const openTickets = tickets.filter(t => t.status !== 'resolved').length;
    const onlineProjects = projects.filter(p => p.status === 'online').length;

    let msg = `📊 *Сводка мониторинга Lerman:*\n\n`;
    msg += `🌐 Проектов онлайн: *${onlineProjects}/${projects.length}*\n`;
    msg += `📩 Открытых обращений: *${openTickets}*\n\n`;
    msg += `*Статус проектов:*\n`;

    projects.forEach(p => {
      const icon = p.status === 'online' ? '🟢' : '🔴';
      msg += `${icon} *${p.name}* — ${p.latencyMs || 0}ms (${p.status})\n`;
    });

    ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
      ])
    });
  }

  handleDevInfo(ctx) {
    if (ctx.answerCbQuery) ctx.answerCbQuery();
    return ctx.reply(
      `⚡ *Вход для Разработчика*\n\n` +
      `Аккаунт разработчика привязан к номеру: *+998334906969*\n\n` +
      `Нажмите кнопку *«📱 Прислать номер»* внизу для авторизации.\n\n` +
      `_Учетные данные:_\n` +
      `👤 *Логин:* \`Lerman_dev\`\n` +
      `🔑 *Пароль:* \`2010090900\``,
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          [Markup.button.contactRequest('📱 Прислать номер')]
        ]).resize().oneTime()
      }
    );
  }

  async sendToAdmin(message, extra = {}) {
    const targetChat = this.adminChatId || config.adminChatId;
    if (!this.bot || !targetChat) {
      console.log(`📢 [MOCK BOT NOTIFICATION] В чат ${targetChat || 'ADMIN'}:\n${message}`);
      db.addLog({ type: 'notification_mock', text: message });
      return false;
    }

    try {
      await this.bot.telegram.sendMessage(targetChat, message, {
        parse_mode: 'Markdown',
        ...extra
      });
      db.addLog({ type: 'notification_sent', text: message });
      return true;
    } catch (err) {
      console.error('Ошибка отправки сообщения в Telegram:', err.message);
      db.addLog({ type: 'notification_error', error: err.message });
      return false;
    }
  }

  async notifySupportTicket(ticket, project) {
    const projectName = project ? project.name : 'Неизвестный проект';
    const message = 
      `🚨 *НОВЫЙ ЗАПРОС ПОДДЕРЖКИ!*\n\n` +
      `📁 *Проект:* ${projectName}\n` +
      `👤 *Клиент:* ${ticket.clientName} (${ticket.clientContact || 'нет контакта'})\n` +
      `⚡ *Приоритет:* ${ticket.priority || 'Обычный'}\n\n` +
      `💬 *Сообщение клиента:*\n` +
      `> "${ticket.message}"\n\n` +
      `⏰ _Время: ${new Date().toLocaleTimeString('ru-RU')}_`;

    const buttons = [
      [
        Markup.button.callback('⚡ В работу', `tkt_work:${ticket.id}`),
        Markup.button.callback('✅ Решено', `tkt_done:${ticket.id}`)
      ],
      [Markup.button.webApp('📱 Открыть в Lerman Mini App', this.appUrl)]
    ];

    return this.sendToAdmin(message, Markup.inlineKeyboard(buttons));
  }

  async notifyUptimeChange(project, isOnline, errorOrLatency) {
    let message = '';
    if (!isOnline) {
      message = 
        `🔥 *ТРЕВОГА: ПРОЕКТ УПАЛ!*\n\n` +
        `📁 *Проект:* ${project.name}\n` +
        `🔗 *URL:* ${project.url}\n` +
        `❌ *Ошибка:* \`${errorOrLatency}\`\n\n` +
        `⚠️ Срочно проверьте сервер или службу!`;
    } else {
      message = 
        `✅ *ПРОЕКТ ВОССТАНОВЛЕН!*\n\n` +
        `📁 *Проект:* ${project.name}\n` +
        `⚡ *Отклик:* ${errorOrLatency}ms\n` +
        `🟢 Сайт снова в сети и отвечает штатно.`;
    }

    const buttons = [
      [Markup.button.webApp('📱 Открыть монитор', this.appUrl)]
    ];

    return this.sendToAdmin(message, Markup.inlineKeyboard(buttons));
  }

  async notifyAppUpdate(projectName, version, releaseNotes) {
    const message = 
      `🚀 *НОВОЕ ОБНОВЛЕНИЕ РЕЛИЗА!*\n\n` +
      `📁 *Проект:* ${projectName}\n` +
      `🏷️ *Версия:* \`${version}\`\n\n` +
      `📝 *Что изменилось:*\n` +
      `${releaseNotes}\n\n` +
      `📲 Обновление развернуто и доступно на устройствах!`;

    const buttons = [
      [Markup.button.webApp('🚀 Открыть Lerman Mini App', this.appUrl)]
    ];

    return this.sendToAdmin(message, Markup.inlineKeyboard(buttons));
  }

  async notifyExternalEvent(projectName, title, body, level = 'info') {
    const icon = level === 'danger' || level === 'error' ? '🔴' : level === 'warning' ? '🟡' : 'ℹ️';
    const message = 
      `${icon} *СОБЫТИЕ ПРОЕКТА: ${projectName}*\n\n` +
      `📌 *${title}*\n\n` +
      `${body}\n\n` +
      `⏰ _${new Date().toLocaleTimeString('ru-RU')}_`;

    return this.sendToAdmin(message, Markup.inlineKeyboard([
      [Markup.button.webApp('📱 Открыть Mini App', this.appUrl)]
    ]));
  }

  async sendAuthConfirmation(targetChatId, { authSessionId, code, username, role }) {
    if (!this.bot || !targetChatId) {
      console.log(`[AUTH 2FA] Bot not running or targetChatId empty (${targetChatId}). Code: ${code}`);
      return false;
    }

    const roleBadge = role === 'developer' ? '⚡ Разработчик' : '👤 Пользователь';
    const message = 
      `🔐 *ПОДТВЕРЖДЕНИЕ ВХОДА С ПК (2FA)*\n\n` +
      `Обнаружен вход в аккаунт через веб-браузер на компьютере.\n\n` +
      `👤 *Пользователь:* \`${username}\`\n` +
      `🏷️ *Статус:* ${roleBadge}\n` +
      `⏰ *Время:* ${new Date().toLocaleTimeString('ru-RU')}\n\n` +
      `🔑 *Ваш код подтверждения:*\n` +
      `👉 \`${code}\`\n\n` +
      `_Введите эти 6 цифр на компьютере или просто нажмите кнопку ниже для быстрого входа:_`;

    const buttons = [
      [
        Markup.button.callback('✅ Разрешить вход на ПК', `auth_allow:${authSessionId}`),
        Markup.button.callback('❌ Отклонить', `auth_deny:${authSessionId}`)
      ]
    ];

    try {
      await this.bot.telegram.sendMessage(targetChatId, message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      });
      return true;
    } catch (err) {
      console.error('Ошибка отправки 2FA в Telegram:', err.message);
      return false;
    }
  }
}

export const telegramBot = new TelegramBotManager();

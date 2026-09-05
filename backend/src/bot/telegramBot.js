import { Telegraf, Markup } from 'telegraf';
import { config } from '../config.js';
import { db } from '../db/database.js';

class TelegramBotManager {
  constructor() {
    this.bot = null;
    this.adminChatId = config.adminChatId || db.getSettings()?.adminChatId || '';
    this.appUrl = config.appUrl;
    this.init();
  }

  init() {
    if (!config.botToken) {
      console.log('ℹ️ [TELEGRAM BOT] Токен бота не указан в .env. Бот работает в режиме эмуляции (уведомления пишутся в консоль и сохраняются в логи).');
      return;
    }

    try {
      this.bot = new Telegraf(config.botToken);

      this.bot.start((ctx) => {
        const chatId = ctx.chat.id;
        console.log(`👤 Пользователь запустил бота. Chat ID: ${chatId}`);
        
        // Auto-set adminChatId
        this.adminChatId = chatId.toString();
        db.updateSettings({ adminChatId: this.adminChatId });
        console.log(`✅ Chat ID ${chatId} сохранен как ADMIN_CHAT_ID.`);

        const miniAppUrl = this.appUrl;

        ctx.reply(
          `🛡️ *Добро пожаловать в Lerman Cyber Monitor & Mini App!*\n\n` +
          `Ваш персональный центр управления всеми проектами, паролями, медиа и мониторингом.\n\n` +
          `🆔 Ваш Chat ID: \`${chatId}\`\n\n` +
          `Нажмите кнопку ниже, чтобы открыть Mini App прямо в Telegram:`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.webApp('🚀 Открыть Lerman Mini App', miniAppUrl)],
              [Markup.button.callback('📊 Статус систем', 'cmd_status')]
            ])
          }
        );
      });

      this.bot.command('status', (ctx) => this.handleStatusCommand(ctx));
      this.bot.action('cmd_status', (ctx) => this.handleStatusCommand(ctx));

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

  /**
   * Отправка уведомления о новом запросе поддержки от клиента
   */
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

  /**
   * Уведомление об изменении статуса доступности (Uptime / Downtime)
   */
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

  /**
   * Уведомление об обновлении приложения / проекта
   */
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

  /**
   * Универсальное уведомление из другого проекта по API
   */
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
}

export const telegramBot = new TelegramBotManager();

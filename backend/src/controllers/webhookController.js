import { db } from '../db/database.js';
import { telegramBot } from '../bot/telegramBot.js';
import { config } from '../config.js';

export const webhookController = {
  /**
   * Прием событий от внешних проектов по API Key
   */
  async handleEvent(req, res) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey;
    if (!apiKey) {
      return res.status(401).json({ success: false, error: 'Отсутствует x-api-key заголовок' });
    }

    const projects = db.getCollection('projects');
    const project = projects.find(p => p.apiKey === apiKey);

    if (!project) {
      return res.status(403).json({ success: false, error: 'Неверный API-ключ проекта' });
    }

    const { type = 'event', title, message, level = 'info', version, releaseNotes, clientName, clientContact } = req.body;

    if (type === 'update' || type === 'release') {
      const newVersion = version || 'v' + Date.now();
      db.update('projects', project.id, { version: newVersion });
      await telegramBot.notifyAppUpdate(project.name, newVersion, releaseNotes || message || 'Техническое обновление');
      return res.json({ success: true, message: 'Уведомление об обновлении отправлено в Telegram' });
    }

    if (type === 'ticket' || type === 'support') {
      const newTicket = db.insert('tickets', {
        projectId: project.id,
        clientName: clientName || 'Внешний клиент',
        clientContact: clientContact || 'Форма на сайте',
        message: message || title || 'Новое обращение',
        status: 'new',
        priority: level === 'danger' ? 'critical' : 'normal'
      });
      await telegramBot.notifySupportTicket(newTicket, project);
      return res.json({ success: true, ticketId: newTicket.id, message: 'Тикет создан и отправлен в Telegram' });
    }

    // Default generic alert
    await telegramBot.notifyExternalEvent(project.name, title || 'Оповещение системы', message || '', level);
    db.addLog({
      type: 'external_webhook',
      projectName: project.name,
      title,
      level
    });

    res.json({ success: true, message: 'Событие успешно получено и отправлено в Telegram' });
  },

  /**
   * Готовые примеры интеграции и код виджета для клиентов
   */
  getIntegrationGuides(req, res) {
    const { projectId } = req.query;
    const project = projectId ? db.findById('projects', projectId) : db.getCollection('projects')[0];
    const apiKey = project ? project.apiKey : 'YOUR_PROJECT_API_KEY';
    const baseUrl = config.appUrl || 'http://localhost:5000';

    const curlSupport = `curl -X POST "${baseUrl}/api/v1/projects/event" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "type": "ticket",
    "clientName": "Иван Смирнов",
    "clientContact": "+79990001122 / Telegram",
    "message": "Пофиксите авторизацию на сайте",
    "level": "warning"
  }'`;

    const curlRelease = `curl -X POST "${baseUrl}/api/v1/projects/event" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "type": "update",
    "version": "v2.1.0",
    "releaseNotes": "1. Ускорена загрузка на 40%\\n2. Исправлен баг с оплатой"
  }'`;

    const pythonSnippet = `import requests

API_KEY = "${apiKey}"
URL = "${baseUrl}/api/v1/projects/event"

# Отправка ошибки или алерта
requests.post(URL, headers={"x-api-key": API_KEY}, json={
    "type": "event",
    "title": "Сбой фонового воркера",
    "message": "Превышен лимит памяти на задаче #42",
    "level": "danger"
})`;

    const widgetSnippet = `<!-- Lerman Support Widget: вставьте перед закрывающим тегом </body> любого сайта -->
<div id="lerman-widget-root"></div>
<script>
(function() {
  const btn = document.createElement('button');
  btn.innerHTML = '💬 Поддержка';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;background:#00f2fe;color:#000;font-weight:bold;padding:12px 20px;border-radius:30px;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,242,254,0.4);font-family:sans-serif;';
  btn.onclick = function() {
    const name = prompt('Ваше имя:');
    if (!name) return;
    const contact = prompt('Ваш контакт (Telegram/Email/Телефон):');
    const msg = prompt('Опишите ваш вопрос или проблему:');
    if (!msg) return;

    fetch('${baseUrl}/api/v1/projects/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': '${apiKey}' },
      body: JSON.stringify({ type: 'ticket', clientName: name, clientContact: contact, message: msg })
    }).then(r => r.json()).then(data => {
      alert('Ваш запрос передан разработчику! Скоро свяжемся.');
    }).catch(e => alert('Ошибка отправки: ' + e.message));
  };
  document.body.appendChild(btn);
})();
</script>`;

    res.json({
      success: true,
      apiKey,
      projectName: project ? project.name : '',
      snippets: {
        curlSupport,
        curlRelease,
        pythonSnippet,
        widgetSnippet
      }
    });
  }
};

import { db } from '../db/database.js';
import { telegramBot } from '../bot/telegramBot.js';
import { config } from '../config.js';

class MonitorService {
  constructor() {
    this.timer = null;
    this.isChecking = false;
  }

  start() {
    console.log(`⏱️ Сервис Uptime Monitor запущен (интервал: ${config.uptimeIntervalMs / 1000}s)`);
    // Run initial check after 3 seconds
    setTimeout(() => this.checkAll(), 3000);
    this.timer = setInterval(() => this.checkAll(), config.uptimeIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async pingUrl(url) {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Lerman-Cyber-Monitor/1.0'
        }
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const isOnline = res.status >= 200 && res.status < 400;

      return {
        isOnline,
        latencyMs,
        statusCode: res.status,
        error: isOnline ? null : `HTTP Status ${res.status}`
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      return {
        isOnline: false,
        latencyMs,
        statusCode: 0,
        error: err.name === 'AbortError' ? 'Таймаут соединения (8с)' : err.message
      };
    }
  }

  async checkProject(project) {
    if (!project.url || !project.url.startsWith('http')) {
      return null;
    }

    const previousStatus = project.status || 'online';
    const result = await this.pingUrl(project.url);
    const newStatus = result.isOnline ? 'online' : 'offline';

    const updates = {
      status: newStatus,
      latencyMs: result.latencyMs,
      statusCode: result.statusCode,
      lastChecked: new Date().toISOString(),
      lastError: result.error
    };

    db.update('projects', project.id, updates);

    // If status changed, send instant Telegram alert!
    if (previousStatus !== newStatus) {
      db.addLog({
        type: 'uptime_change',
        projectId: project.id,
        projectName: project.name,
        from: previousStatus,
        to: newStatus,
        error: result.error,
        latency: result.latencyMs
      });

      if (newStatus === 'offline') {
        await telegramBot.notifyUptimeChange(project, false, result.error);
      } else {
        await telegramBot.notifyUptimeChange(project, true, result.latencyMs);
      }
    }

    return { ...project, ...updates };
  }

  async checkAll() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const projects = db.getCollection('projects');
      for (const project of projects) {
        await this.checkProject(project);
      }
    } catch (err) {
      console.error('Ошибка в цикле мониторинга:', err);
    } finally {
      this.isChecking = false;
    }
  }
}

export const monitorService = new MonitorService();

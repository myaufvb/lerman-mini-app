import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  users: [
    {
      id: 'usr-admin',
      login: 'admin',
      phone: '+79990000000',
      password: 'admin',
      name: 'Lerman Admin',
      telegramId: '',
      createdAt: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'РКС Кибербезопасность',
      slug: 'rks-security',
      description: 'Система контроля периметра, аудит уязвимостей и защита API',
      url: 'https://google.com', // Рабочий URL для проверки аптайма
      status: 'online',
      latencyMs: 45,
      lastChecked: new Date().toISOString(),
      version: 'v2.4.1',
      apiKey: 'rks_live_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    },
    {
      id: 'proj-2',
      name: 'Lerman Mobile Client',
      slug: 'lerman-mobile',
      description: 'Мобильное приложение для клиентов iOS / Android',
      url: 'https://github.com',
      status: 'online',
      latencyMs: 72,
      lastChecked: new Date().toISOString(),
      version: 'v1.1.0',
      apiKey: 'mob_live_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    }
  ],
  credentials: [
    {
      id: 'cred-1',
      projectId: 'proj-1',
      title: 'Root SSH Server',
      login: 'admin_lerman',
      passwordEncrypted: 'c871239bf0192', // We will encrypt properly in cryptoService
      iv: '',
      authTag: '',
      url: 'ssh://194.87.12.99:22',
      category: 'server',
      notes: 'Главный боевой сервер продакшена. Доступ только по ключу/паролю',
      createdAt: new Date().toISOString()
    }
  ],
  media: [
    {
      id: 'med-1',
      projectId: 'proj-1',
      filename: 'sample-diagram.png',
      originalName: 'Схема_архитектуры.png',
      mimeType: 'image/png',
      size: 1048576,
      type: 'image',
      url: '/uploads/sample-diagram.png',
      caption: 'Диаграмма сетевой инфраструктуры RKS',
      createdAt: new Date().toISOString()
    }
  ],
  tickets: [
    {
      id: 'tkt-101',
      projectId: 'proj-1',
      clientName: 'Алексей (Инженер безопасности)',
      clientContact: '@alex_sec',
      message: 'Привет! Заметили всплеск 403 на эндпоинте авторизации, пофиксите пожалуйста конфигурацию WAF',
      status: 'new', // new, in_progress, resolved
      priority: 'high',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  secrets: [],
  wallpapers: [
    {
      id: 'wp-cyber-grid',
      name: 'Cyberpunk Neon Matrix',
      type: 'gradient',
      url: 'radial-gradient(circle at 50% 20%, #0d1b2a 0%, #050811 100%)',
      preview: 'linear-gradient(135deg, #0d1b2a, #050811)',
      isDefault: true
    },
    {
      id: 'wp-neon-glow',
      name: 'Neon Cyber Blue',
      type: 'gradient',
      url: 'linear-gradient(135deg, #070e20 0%, #0a192f 50%, #020c1b 100%)',
      preview: 'linear-gradient(135deg, #070e20, #0a192f)',
      isDefault: false
    },
    {
      id: 'wp-dark-obsidian',
      name: 'Deep Obsidian Glass',
      type: 'gradient',
      url: 'radial-gradient(ellipse at bottom, #111827 0%, #030712 100%)',
      preview: 'linear-gradient(135deg, #111827, #030712)',
      isDefault: false
    }
  ],
  settings: {
    masterPinHash: '', // if empty, no pin required initially
    hasMasterPin: false,
    activeWallpaperId: 'wp-cyber-grid',
    customWallpaperUrl: '',
    customWallpaperType: 'gradient', // 'image' | 'video' | 'gradient'
    glassBlur: 16,
    cardOpacity: 85,
    notificationsEnabled: true
  },
  logs: []
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.write(defaultData);
    }
  }

  read() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Database read error, restoring default:', err);
      this.write(defaultData);
      return defaultData;
    }
  }

  write(data) {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  }

  getCollection(name) {
    const data = this.read();
    return data[name] || [];
  }

  saveCollection(name, items) {
    const data = this.read();
    data[name] = items;
    this.write(data);
  }

  find(collectionName, filterFn = () => true) {
    const items = this.getCollection(collectionName);
    return items.filter(filterFn);
  }

  findById(collectionName, id) {
    const items = this.getCollection(collectionName);
    return items.find(item => item.id === id);
  }

  insert(collectionName, item) {
    const items = this.getCollection(collectionName);
    if (!item.id) {
      item.id = `${collectionName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    items.unshift(item);
    this.saveCollection(collectionName, items);
    return item;
  }

  update(collectionName, id, updates) {
    const items = this.getCollection(collectionName);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveCollection(collectionName, items);
    return items[index];
  }

  delete(collectionName, id) {
    const items = this.getCollection(collectionName);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length !== items.length) {
      this.saveCollection(collectionName, filtered);
      return true;
    }
    return false;
  }

  getSettings() {
    const data = this.read();
    return data.settings || defaultData.settings;
  }

  updateSettings(updates) {
    const data = this.read();
    data.settings = { ...data.settings, ...updates };
    this.write(data);
    return data.settings;
  }

  addLog(entry) {
    const items = this.getCollection('logs');
    items.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    });
    // Keep max 200 logs
    if (items.length > 200) items.length = 200;
    this.saveCollection('logs', items);
  }
}

export const db = new Database();

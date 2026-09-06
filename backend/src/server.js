import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import { monitorService } from './services/monitorService.js';
import { telegramBot } from './bot/telegramBot.js';

import { projectsController } from './controllers/projectsController.js';
import { vaultController } from './controllers/vaultController.js';
import { mediaController, upload } from './controllers/mediaController.js';
import { ticketsController } from './controllers/ticketsController.js';
import { secretsController } from './controllers/secretsController.js';
import { settingsController } from './controllers/settingsController.js';
import { webhookController } from './controllers/webhookController.js';
import { authController } from './controllers/authController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
app.use('/uploads', express.static(config.uploadDir));

// --- API ROUTES ---

// Auth
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/verify-telegram', authController.verifyTelegram);
app.get('/api/auth/check-status', authController.checkStatus);
app.post('/api/auth/resend-code', authController.resendCode);
app.get('/api/auth/me', authController.getMe);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Lerman Cyber Monitor API'
  });
});

// 1. Projects
app.get('/api/projects', projectsController.getAll);
app.get('/api/projects/:id', projectsController.getById);
app.post('/api/projects', projectsController.create);
app.put('/api/projects/:id', projectsController.update);
app.delete('/api/projects/:id', projectsController.delete);
app.post('/api/projects/:id/ping', projectsController.ping);

// 2. Vault (Credentials)
app.get('/api/vault', vaultController.getAll);
app.post('/api/vault', vaultController.create);
app.put('/api/vault/:id', vaultController.update);
app.delete('/api/vault/:id', vaultController.delete);

// 3. Media (Photos / Videos)
app.get('/api/media', mediaController.getAll);
app.post('/api/media', upload.single('file'), mediaController.uploadFile);
app.delete('/api/media/:id', mediaController.delete);

// 4. Support Tickets
app.get('/api/tickets', ticketsController.getAll);
app.get('/api/tickets/:id', ticketsController.getById);
app.post('/api/tickets', ticketsController.create);
app.post('/api/support/ticket', ticketsController.create); // public alias for external forms
app.put('/api/tickets/:id/status', ticketsController.updateStatus);
app.delete('/api/tickets/:id', ticketsController.delete);

// 5. One-Time Secrets (Burn on read)
app.post('/api/secrets', secretsController.create);
app.get('/api/secrets/:id', secretsController.getAndBurn);

// 6. Settings, Wallpapers & Master PIN
app.get('/api/settings', settingsController.get);
app.put('/api/settings', settingsController.update);
app.post('/api/settings/pin', settingsController.setMasterPin);
app.post('/api/settings/pin/verify', settingsController.verifyMasterPin);
app.post('/api/settings/wallpaper', upload.single('wallpaper'), settingsController.uploadWallpaper);
app.post('/api/settings/wallpaper-url', settingsController.addWallpaperByUrl);
app.delete('/api/settings/wallpaper/:id', settingsController.deleteWallpaper);

// 7. Webhook & Integration API for other projects
app.post('/api/v1/projects/event', webhookController.handleEvent);
app.get('/api/integration/guides', webhookController.getIntegrationGuides);

// --- SERVE FRONTEND (FOR RENDER.COM & PRODUCTION) ---
const possibleDists = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist')
];
const frontendDist = possibleDists.find(p => fs.existsSync(p));

if (frontendDist) {
  console.log(`📁 Обнаружена папка frontend/dist (${frontendDist}), раздаем статику...`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  console.log('⚠️ Папка frontend/dist не найдена, API работает в режиме бэкенда.');
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; background: #070b14; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 style="color: #00f2fe;">🛡️ Lerman Cyber Monitor & Mini App</h1>
        <p>Сервер и API успешно запущены!</p>
        <p><a href="/api/health" style="color: #4facfe;">Проверить статус API /api/health</a></p>
      </div>
    `);
  });
}

// Start Server (listening on 0.0.0.0 for Render.com & cloud compatibility)
const serverPort = process.env.PORT || config.port || 5000;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 LERMAN MINI APP BACKEND ЗАПУЩЕН НА ПОРТУ ${serverPort}`);
  console.log(`🔗 API URL: http://localhost:${serverPort}/api/health`);
  console.log(`====================================================`);

  // Start background uptime monitor
  monitorService.start();
});

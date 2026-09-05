import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: process.env.PORT || 5000,
  botToken: process.env.BOT_TOKEN || '8933158920:AAF2c-1-mko0lqN-y52T5F2ZP6sBfcSnyvw',
  adminChatId: process.env.ADMIN_CHAT_ID || '',
  appUrl: process.env.APP_URL || 'https://lerman-mini-app.onrender.com',
  encryptionKey: process.env.ENCRYPTION_KEY || 'lerman-cyber-security-master-key-32b!',
  uptimeIntervalMs: parseInt(process.env.UPTIME_INTERVAL_MS || '60000', 10), // 1 min by default
  uploadDir: path.resolve(__dirname, '../uploads'),
  dataDir: path.resolve(__dirname, '../data')
};

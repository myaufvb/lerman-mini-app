import crypto from 'crypto';
import { config } from '../config.js';

// Derive 32-byte key from config.encryptionKey
const KEY = crypto.createHash('sha256').update(config.encryptionKey).digest();

export const cryptoService = {
  /**
   * Encrypt text with AES-256-GCM
   */
  encrypt(plainText) {
    if (!plainText) return { cipherText: '', iv: '', authTag: '' };
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      cipherText: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag
    };
  },

  /**
   * Decrypt AES-256-GCM
   */
  decrypt(cipherText, ivHex, authTagHex) {
    if (!cipherText) return '';
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(cipherText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Decryption failed:', err.message);
      return '[Ошибка дешифрования]';
    }
  },

  /**
   * Hash Master PIN with salt
   */
  hashPin(pin) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(pin, salt, 10000, 32, 'sha256').toString('hex');
    return `${salt}:${hash}`;
  },

  /**
   * Verify Master PIN
   */
  verifyPin(pin, storedHash) {
    if (!storedHash) return true; // no pin set yet
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(pin, salt, 10000, 32, 'sha256').toString('hex');
    return computedHash === originalHash;
  }
};

import { db } from '../db/database.js';
import { cryptoService } from '../services/cryptoService.js';

export const settingsController = {
  get(req, res) {
    const settings = db.getSettings();
    const wallpapers = db.getCollection('wallpapers');
    res.json({
      success: true,
      settings: {
        activeWallpaperId: settings.activeWallpaperId,
        customWallpaperUrl: settings.customWallpaperUrl,
        customWallpaperType: settings.customWallpaperType,
        glassBlur: settings.glassBlur || 16,
        cardOpacity: settings.cardOpacity || 85,
        hasMasterPin: Boolean(settings.masterPinHash),
        notificationsEnabled: settings.notificationsEnabled !== false
      },
      wallpapers
    });
  },

  update(req, res) {
    const { activeWallpaperId, customWallpaperUrl, customWallpaperType, glassBlur, cardOpacity, notificationsEnabled } = req.body;
    const updates = {};
    if (activeWallpaperId !== undefined) updates.activeWallpaperId = activeWallpaperId;
    if (customWallpaperUrl !== undefined) updates.customWallpaperUrl = customWallpaperUrl;
    if (customWallpaperType !== undefined) updates.customWallpaperType = customWallpaperType;
    if (glassBlur !== undefined) updates.glassBlur = Number(glassBlur);
    if (cardOpacity !== undefined) updates.cardOpacity = Number(cardOpacity);
    if (notificationsEnabled !== undefined) updates.notificationsEnabled = Boolean(notificationsEnabled);

    const updated = db.updateSettings(updates);
    res.json({ success: true, settings: updated });
  },

  setMasterPin(req, res) {
    const { pin, currentPin } = req.body;
    const settings = db.getSettings();

    if (settings.masterPinHash) {
      // Must verify current pin before changing
      if (!cryptoService.verifyPin(currentPin, settings.masterPinHash)) {
        return res.status(401).json({ success: false, error: 'Текущий Master PIN введен неверно' });
      }
    }

    if (!pin || pin.length < 4) {
      return res.status(400).json({ success: false, error: 'PIN код должен состоять минимум из 4 цифр' });
    }

    const pinHash = cryptoService.hashPin(pin);
    db.updateSettings({ masterPinHash: pinHash, hasMasterPin: true });

    db.addLog({ type: 'pin_changed' });
    res.json({ success: true, message: 'Master PIN успешно сохранен' });
  },

  verifyMasterPin(req, res) {
    const { pin } = req.body;
    const settings = db.getSettings();

    if (!settings.masterPinHash) {
      return res.json({ success: true, valid: true, message: 'PIN не установлен' });
    }

    const isValid = cryptoService.verifyPin(pin, settings.masterPinHash);
    if (!isValid) {
      return res.status(401).json({ success: false, valid: false, error: 'Неверный PIN код' });
    }

    res.json({ success: true, valid: true });
  },

  uploadWallpaper(req, res) {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл обоев не прикреплен' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const wallpaperUrl = `/uploads/${req.file.filename}`;
    const wallpaperType = isVideo ? 'video' : 'image';

    const newWp = db.insert('wallpapers', {
      name: req.file.originalname,
      type: wallpaperType,
      url: wallpaperUrl,
      preview: wallpaperUrl,
      isDefault: false
    });

    db.updateSettings({
      activeWallpaperId: newWp.id,
      customWallpaperUrl: wallpaperUrl,
      customWallpaperType: wallpaperType
    });

    res.status(201).json({
      success: true,
      wallpaper: newWp,
      message: 'Обои успешно загружены и применены!'
    });
  }
};

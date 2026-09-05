import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/database.js';
import { config } from '../config.js';

// Ensure uploads dir exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `med-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB max for videos/photos
});

export const mediaController = {
  getAll(req, res) {
    const { projectId, type } = req.query;
    let list = db.getCollection('media');

    if (projectId) {
      list = list.filter(m => m.projectId === projectId);
    }
    if (type) {
      list = list.filter(m => m.type === type);
    }

    res.json({ success: true, media: list });
  },

  uploadFile(req, res) {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл не прикреплен' });
    }

    const { projectId, caption } = req.body;
    const isVideo = req.file.mimetype.startsWith('video/');

    const item = db.insert('media', {
      projectId: projectId || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      type: isVideo ? 'video' : 'image',
      url: `/uploads/${req.file.filename}`,
      caption: caption || req.file.originalname
    });

    db.addLog({ type: 'media_uploaded', filename: item.filename, type: item.type });
    res.status(201).json({ success: true, item });
  },

  delete(req, res) {
    const item = db.findById('media', req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Медиафайл не найден' });
    }

    const filePath = path.join(config.uploadDir, item.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    db.delete('media', req.params.id);
    res.json({ success: true, message: 'Файл успешно удален' });
  }
};

import React, { useState } from 'react';
import { FolderPlus, X, Globe, Tag, AlignLeft } from 'lucide-react';
import { api } from '../services/api';

export function NewProjectModal({ isOpen, onClose, onCreated, onHaptic }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.createProject({
        name,
        url: url.trim(),
        version: version.trim(),
        description: description.trim()
      });
      onHaptic?.notification('success');
      onCreated(res.project);
      onClose();
      // Reset
      setName('');
      setUrl('');
      setVersion('1.0.0');
      setDescription('');
    } catch (err) {
      alert('Ошибка при создании проекта: ' + err.message);
      onHaptic?.notification('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Новый проект</h3>
              <p className="text-[11px] text-slate-400">Мониторинг, пароли и поддержка</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Название проекта <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: Сервер РКС Продакшн"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              URL для мониторинга (Uptime Ping)
            </label>
            <input
              type="url"
              placeholder="https://my-app.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400">
              Бот будет автоматически проверять доступность каждые 60 секунд.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Версия приложения / сборки
            </label>
            <input
              type="text"
              placeholder="v1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
              Описание и заметки
            </label>
            <textarea
              rows={2}
              placeholder="Кратко о назначении проекта..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? 'Создание...' : 'Добавить проект'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

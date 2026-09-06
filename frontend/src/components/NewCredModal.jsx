import React, { useState } from 'react';
import { KeyRound, X, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export function NewCredModal({ isOpen, onClose, projects, onCreated, onHaptic }) {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('server');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const generatePassword = () => {
    onHaptic?.impact('light');
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?';
    let generated = '';
    for (let i = 0; i < 18; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !login.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.createCredential({
        projectId,
        title: title.trim(),
        login: login.trim(),
        password,
        url: url.trim(),
        category,
        notes: notes.trim()
      });

      onHaptic?.notification('success');
      onCreated(res.credential);
      onClose();
      // Reset
      setTitle('');
      setLogin('');
      setPassword('');
      setUrl('');
      setNotes('');
    } catch (err) {
      alert('Ошибка при сохранении пароля: ' + err.message);
      onHaptic?.notification('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Добавить в Сейф (Vault)</h3>
              <p className="text-[11px] text-slate-400">Зашифрованное хранилище AES-256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AES-256 Encryption Security Notice */}
        <div className="mb-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong>Безопасность данных:</strong> ваши пароли и ключи будут автоматически зашифрованы алгоритмом <strong>AES-256-GCM</strong> и храниться исключительно в зашифрованном виде.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Project selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Проект
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Общий доступ / Без привязки --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Название сервиса / узла <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: SSH Root Server, Postgres DB, Админка"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Логин / Email <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="admin / user@domain"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="server">Сервер / SSH</option>
                <option value="database">База данных</option>
                <option value="api">API Ключ</option>
                <option value="admin">Панель управления</option>
                <option value="client">Доступ клиента</option>
              </select>
            </div>
          </div>

          {/* Password with Generator */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Пароль / Секретный ключ
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Сгенерировать
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-10 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Хост / URL входа
            </label>
            <input
              type="text"
              placeholder="ssh://194.87.12.99 или https://admin.site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Заметки (2FA, порты, инструкции)
            </label>
            <textarea
              rows={2}
              placeholder="Дополнительные сведения о доступе..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? 'Шифрование...' : 'Зашифровать и сохранить'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

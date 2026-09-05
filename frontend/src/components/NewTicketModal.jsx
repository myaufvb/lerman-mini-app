import React, { useState } from 'react';
import { MessageSquareWarning, X, Send, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export function NewTicketModal({ isOpen, onClose, projects, onCreated, onHaptic }) {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('high');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !message.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.createTicket({
        projectId,
        clientName: clientName.trim(),
        clientContact: clientContact.trim(),
        message: message.trim(),
        priority
      });

      onHaptic?.notification('success');
      onCreated(res.ticket);
      alert('Запрос поддержки успешно создан и отправлен в Telegram бот!');
      onClose();
      // Reset
      setClientName('');
      setClientContact('');
      setMessage('');
    } catch (err) {
      alert('Ошибка отправки тикета: ' + err.message);
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Новый запрос поддержки</h3>
              <p className="text-[11px] text-slate-400">Мгновенный пуш в Telegram бота</p>
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
              Проект, по которому пишет клиент
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Имя клиента <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Иван Смирнов"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Контакт (TG / телефон)
              </label>
              <input
                type="text"
                placeholder="@username или +7..."
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Приоритет
            </label>
            <div className="flex gap-2">
              {[
                { id: 'normal', label: 'Обычный', color: 'border-slate-600 text-slate-300' },
                { id: 'high', label: 'Срочно', color: 'border-amber-500/50 text-amber-400' },
                { id: 'critical', label: '🔥 Авария', color: 'border-rose-500/50 text-rose-400' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    priority === p.id ? 'bg-white/15 ' + p.color : 'bg-white/5 border-transparent text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Что написал клиент (Суть проблемы / задачи) <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Пофиксите авторизацию на сайте, выдает ошибку 500 при клике..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Отправка...' : 'Отправить в Telegram бот'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

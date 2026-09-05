import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  AlertCircle, 
  Flame, 
  Send 
} from 'lucide-react';
import { api } from '../services/api';

export function TicketsView({ 
  tickets, 
  projects, 
  onOpenNewTicket, 
  onRefresh, 
  onHaptic 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  const handleStatusChange = async (ticketId, newStatus) => {
    onHaptic?.impact('medium');
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      onHaptic?.notification('success');
      onRefresh();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDelete = async (ticketId) => {
    if (confirm('Удалить это обращение?')) {
      onHaptic?.notification('warning');
      try {
        await api.deleteTicket(ticketId);
        onRefresh();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filtered = tickets.filter(t => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesProject = filterProject === 'all' || t.projectId === filterProject;
    return matchesStatus && matchesProject;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Новый
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> В работе
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Решено
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-amber-400" />
              Поддержка & Обращения
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Входящие сообщения от клиентов по всем проектам
            </p>
          </div>

          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Тест тикета</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <div className="flex bg-white/5 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Все' },
              { id: 'new', label: 'Новые' },
              { id: 'in_progress', label: 'В работе' },
              { id: 'resolved', label: 'Решенные' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  filterStatus === tab.id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">Все проекты ({tickets.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-white/5">
            <p className="text-sm">Нет обращений по выбранным фильтрам.</p>
            <button
              onClick={onOpenNewTicket}
              className="mt-3 text-xs text-amber-400 underline font-semibold"
            >
              Отправить тестовый тикет в Telegram бота
            </button>
          </div>
        ) : (
          filtered.map((ticket) => {
            const project = projects.find(p => p.id === ticket.projectId);

            return (
              <div
                key={ticket.id}
                className="glass-panel hover:glass-panel-glow rounded-3xl p-4 border border-white/10 transition-all space-y-3 relative overflow-hidden"
              >
                {/* Header with Client Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {ticket.clientName}
                      </h4>
                      {ticket.priority === 'critical' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 animate-pulse flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" /> Критично
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-400">
                        📁 {project ? project.name : ticket.projectName || 'Общий'}
                      </span>
                      {ticket.clientContact && (
                        <span>• 👤 {ticket.clientContact}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(ticket.status)}
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-200 leading-relaxed font-sans">
                  "{ticket.message}"
                </div>

                {/* Status Switchers & Timestamp */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>
                    {new Date(ticket.createdAt).toLocaleString('ru-RU')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {ticket.status !== 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-colors"
                      >
                        ⚡ В работу
                      </button>
                    )}
                    {ticket.status !== 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(ticket.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors"
                      >
                        ✅ Решено
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

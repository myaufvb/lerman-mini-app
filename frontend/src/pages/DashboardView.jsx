import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Key, 
  Globe, 
  Tag 
} from 'lucide-react';
import { api } from '../services/api';

export function DashboardView({ 
  projects, 
  currentUser,
  onRefresh, 
  onOpenNewProject, 
  onSelectProject, 
  onHaptic 
}) {
  const isDev = currentUser?.role === 'developer';
  const [pingingId, setPingingId] = useState(null);

  const handlePing = async (id, e) => {
    e.stopPropagation();
    onHaptic?.impact('light');
    setPingingId(id);
    try {
      await api.pingProject(id);
      onHaptic?.notification('success');
      onRefresh();
    } catch (err) {
      onHaptic?.notification('error');
      alert('Ошибка при пинге: ' + err.message);
    } finally {
      setPingingId(null);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (confirm(`Удалить проект "${name}" и все связанные доступы?`)) {
      onHaptic?.notification('warning');
      try {
        await api.deleteProject(id);
        onRefresh();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const onlineCount = projects.filter(p => p.status === 'online').length;
  const offlineCount = projects.filter(p => p.status === 'offline').length;
  const avgLatency = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.latencyMs || 0), 0) / projects.length) 
    : 0;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      
      {/* Top Banner / System Metrics */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              Мониторинг & Uptime
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Автоматический контроль состояния всех сервисов 24/7
            </p>
          </div>
          {isDev && (
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Онлайн</span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-extrabold text-white">{onlineCount}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Ошибки</span>
            <div className="flex items-center gap-1.5 mt-1">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-base font-extrabold text-white">{offlineCount}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Ср. отклик</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-base font-extrabold text-white">{avgLatency}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Активные проекты ({projects.length})
          </h3>
          <span className="text-[11px] text-slate-500">Автопроверка: 60 сек</span>
        </div>

        {projects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-white/5">
            <p className="text-sm">Нет подключенных проектов.</p>
            <button
              onClick={onOpenNewProject}
              className="mt-3 text-xs text-cyan-400 underline font-semibold"
            >
              Создать первый проект
            </button>
          </div>
        ) : (
          projects.map((project) => {
            const isOnline = project.status === 'online';
            const isPinging = pingingId === project.id;

            return (
              <div
                key={project.id}
                className="glass-panel hover:glass-panel-glow rounded-3xl p-4 border border-white/10 transition-all cursor-pointer relative overflow-hidden group"
              >
                {/* Status Indicator Stripe */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isOnline ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 shadow-[0_0_12px_#ef4444]'
                  }`} 
                />

                <div className="flex items-start justify-between gap-2 pl-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-white truncate">
                        {project.name}
                      </h4>
                      {/* Version badge */}
                      {project.version && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {project.version}
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    )}

                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 mt-2 truncate max-w-full font-mono"
                      >
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{project.url}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    )}
                  </div>

                  {/* Actions & Status badge */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isOnline ? 'cyber-badge-online' : 'cyber-badge-offline'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                        {isOnline ? `${project.latencyMs || 0}ms` : 'OFFLINE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handlePing(project.id, e)}
                        disabled={isPinging}
                        title="Проверить отклик прямо сейчас"
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
                      </button>
                      {isDev && (
                        <button
                          onClick={(e) => handleDelete(project.id, project.name, e)}
                          title="Удалить проект"
                          className="p-1.5 bg-white/5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last checked time & API key sneak-peek */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 pl-2">
                  <span>
                    Проверен: {project.lastChecked ? new Date(project.lastChecked).toLocaleTimeString('ru-RU') : 'Ожидает'}
                  </span>
                  <span className="font-mono text-slate-400">
                    ID: {project.id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

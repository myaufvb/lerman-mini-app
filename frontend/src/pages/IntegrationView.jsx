import React, { useState } from 'react';
import { Cpu, Copy, Check, Globe, Key, Send } from 'lucide-react';

export function IntegrationView({ projects, onHaptic }) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [copiedKey, setCopiedKey] = useState(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleCopy = (text, keyName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    onHaptic?.impact('light');
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const projectUrl = selectedProject ? selectedProject.url : '';
  const apiKey = selectedProject ? selectedProject.apiKey : '';
  const origin = window.location.origin;
  const webhookUrl = `${origin}/api/external/projects/${selectedProject?.id || 'PROJECT_ID'}/events`;

  return (
    <div className="space-y-4 pb-24 animate-fade-in max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-black text-white">
            Интеграция проекта
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Ссылки и ключи для подключения ваших проектов и бота
        </p>

        {/* Project Selector if more than 1 */}
        {projects.length > 1 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Выберите проект:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 1. Ссылка на проект */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-2">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          Ссылка на проект:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={projectUrl || 'URL проекта не указан'}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-cyan-300 select-all focus:outline-none"
          />
          <button
            onClick={() => handleCopy(projectUrl, 'url')}
            disabled={!projectUrl}
            className="px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'url' ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
      </div>

      {/* 2. API Ключ проекта / бота */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-2">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Key className="w-4 h-4 text-amber-400" />
          API Ключ проекта / бота:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={apiKey || 'API ключ отсутствует'}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-amber-300 select-all focus:outline-none"
          />
          <button
            onClick={() => handleCopy(apiKey, 'apiKey')}
            disabled={!apiKey}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedKey === 'apiKey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'apiKey' ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
      </div>

      {/* 3. Webhook URL для алертов */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-2">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Send className="w-4 h-4 text-emerald-400" />
          Webhook URL для алертов и уведомлений:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-emerald-300 select-all focus:outline-none"
          />
          <button
            onClick={() => handleCopy(webhookUrl, 'webhook')}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'webhook' ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}

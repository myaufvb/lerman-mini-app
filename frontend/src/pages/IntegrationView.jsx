import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Rocket, 
  Layers, 
  Key, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';

export function IntegrationView({ projects, onHaptic }) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [guides, setGuides] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  useEffect(() => {
    if (selectedProject) {
      api.getIntegrationGuides(selectedProject.id)
        .then(res => setGuides(res))
        .catch(console.error);
    }
  }, [selectedProjectId, selectedProject]);

  const handleCopy = (text, keyName) => {
    navigator.clipboard.writeText(text);
    onHaptic?.impact('light');
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const apiKey = selectedProject ? selectedProject.apiKey : 'API_KEY';
  const origin = window.location.origin;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-black text-white">
            Интеграция с другими проектами
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Подключите любые ваши сайты, боты, мобильные приложения или серверы, чтобы мгновенно получать алерты, баг-репорты и оповещения об обновлениях.
        </p>

        {/* Project Selector & API Key */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Выберите проект:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Key className="w-3 h-3 text-cyan-400" />
                Project Secret API Key
              </span>
              <span className="text-xs font-mono text-cyan-300 truncate select-all">
                {apiKey}
              </span>
            </div>
            <button
              onClick={() => handleCopy(apiKey, 'apiKey')}
              className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-colors"
              title="Скопировать ключ"
            >
              {copiedKey === 'apiKey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Snippet 1: Support Ticket Webhook */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              1. Отправка тикета поддержки (cURL / Fetch)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(guides?.snippets?.curlSupport || '', 'curlSupport')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {copiedKey === 'curlSupport' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Скопировать</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Вызовите этот запрос из контактной формы вашего сайта, и вы получите пуш в Telegram:
        </p>
        <pre className="p-3 bg-black/60 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5">
          {guides?.snippets?.curlSupport}
        </pre>
      </div>

      {/* Snippet 2: App Release Updates */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              2. Оповещение об обновлении версии
            </h3>
          </div>
          <button
            onClick={() => handleCopy(guides?.snippets?.curlRelease || '', 'curlRelease')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {copiedKey === 'curlRelease' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Скопировать</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Интегрируйте в CI/CD (GitHub Actions) или выполните при выкатке релиза:
        </p>
        <pre className="p-3 bg-black/60 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5">
          {guides?.snippets?.curlRelease}
        </pre>
      </div>

      {/* Snippet 3: Embeddable Support Widget */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              3. Готовый виджет для сайтов клиентов
            </h3>
          </div>
          <button
            onClick={() => handleCopy(guides?.snippets?.widgetSnippet || '', 'widgetSnippet')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {copiedKey === 'widgetSnippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Скопировать HTML</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Вставьте этот код на сайт любого вашего клиента перед закрывающим тегом <code className="text-cyan-300">&lt;/body&gt;</code>:
        </p>
        <pre className="p-3 bg-black/60 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5">
          {guides?.snippets?.widgetSnippet}
        </pre>
      </div>

      {/* Render.com Instructions Card */}
      <div className="glass-panel rounded-3xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            Деплой на Render.com (В 1 клик)
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Да, этот проект <strong className="text-cyan-300">полностью оптимизирован для Render.com</strong>! Фронтенд и бэкенд объединены: Express сам раздает статику React Mini App и крутит бота.
        </p>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">1</span>
            <span>Создайте на <strong>Render.com</strong> новый <strong>Web Service</strong> и подключите ваш репозиторий GitHub.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">2</span>
            <span><strong>Build Command:</strong> <code className="text-cyan-300 font-mono">npm run render-build</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">3</span>
            <span><strong>Start Command:</strong> <code className="text-cyan-300 font-mono">npm start</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">4</span>
            <span>Добавьте переменные окружения: <code className="text-cyan-300 font-mono">BOT_TOKEN</code> и <code className="text-cyan-300 font-mono">ADMIN_CHAT_ID</code>.</span>
          </div>
        </div>
      </div>

    </div>
  );
}

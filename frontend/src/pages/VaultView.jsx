import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Flame, 
  Trash2, 
  Lock, 
  Server, 
  Database, 
  Code, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { api } from '../services/api';

export function VaultView({ 
  credentials, 
  projects, 
  isVaultUnlocked, 
  hasMasterPin, 
  onRequestUnlock, 
  onOpenNewCred, 
  onOpenOneTimeSecret, 
  onRefresh, 
  onHaptic 
}) {
  const [copiedField, setCopiedField] = useState(null); // 'login-id' or 'pass-id'
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    onHaptic?.impact('light');
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const togglePasswordVisibility = (id) => {
    onHaptic?.impact('light');
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Удалить доступ "${title}"?`)) {
      onHaptic?.notification('warning');
      try {
        await api.deleteCredential(id);
        onRefresh();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filtered = credentials.filter(c => {
    const matchesProject = selectedProjectId === 'all' || c.projectId === selectedProjectId;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.login.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // If locked by Master PIN
  if (hasMasterPin && !isVaultUnlocked) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center max-w-md mx-auto my-12 border border-white/10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Сейф заблокирован
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Для доступа к зашифрованным паролям и доступам введите ваш Master PIN код.
        </p>
        <button
          onClick={onRequestUnlock}
          className="w-full py-3 rounded-xl cyber-button flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold"
        >
          <KeyRound className="w-4 h-4" />
          Разблокировать Сейф
        </button>
      </div>
    );
  }

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'server': return <Server className="w-3.5 h-3.5 text-cyan-400" />;
      case 'database': return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'api': return <Code className="w-3.5 h-3.5 text-amber-400" />;
      case 'admin': return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      default: return <UserCheck className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* Top Controls */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              Сейф паролей (Vault)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Сквозное шифрование AES-256-GCM
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* One-Time Secret burn button */}
            <button
              onClick={onOpenOneTimeSecret}
              title="Создать одноразовую ссылку (Burn on read)"
              className="px-2.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Одноразовая ссылка</span>
            </button>

            {/* Add credential button */}
            <button
              onClick={onOpenNewCred}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            placeholder="Поиск по названию или логину..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Все проекты ({credentials.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Credentials List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-white/5">
            <p className="text-sm">Нет сохраненных паролей.</p>
            <button
              onClick={onOpenNewCred}
              className="mt-3 text-xs text-cyan-400 underline font-semibold"
            >
              Добавить первый пароль
            </button>
          </div>
        ) : (
          filtered.map((cred) => {
            const project = projects.find(p => p.id === cred.projectId);
            const isPasswordVisible = Boolean(visiblePasswords[cred.id]);

            return (
              <div
                key={cred.id}
                className="glass-panel hover:glass-panel-glow rounded-3xl p-4 border border-white/10 transition-all space-y-3"
              >
                {/* Title & Category & Project */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {getCategoryIcon(cred.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {cred.title}
                      </h4>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {project ? project.name : 'Общий доступ'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(cred.id, cred.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Login row */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400">Логин</span>
                    <span className="text-xs font-mono text-slate-200 truncate select-all">
                      {cred.login}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(cred.login, `login-${cred.id}`)}
                    className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg shrink-0 transition-colors"
                    title="Скопировать логин"
                  >
                    {copiedField === `login-${cred.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Password row */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400">Пароль</span>
                    <span className="text-xs font-mono text-cyan-300 truncate select-all">
                      {isPasswordVisible ? cred.password : '••••••••••••••••'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePasswordVisibility(cred.id)}
                      className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg transition-colors"
                      title={isPasswordVisible ? 'Скрыть' : 'Показать'}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(cred.password, `pass-${cred.id}`)}
                      className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg transition-colors"
                      title="Скопировать пароль"
                    >
                      {copiedField === `pass-${cred.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* URL / Notes if present */}
                {(cred.url || cred.notes) && (
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                    {cred.url && (
                      <div className="truncate font-mono text-slate-300">
                        🔗 {cred.url}
                      </div>
                    )}
                    {cred.notes && (
                      <div className="text-slate-400 italic">
                        📝 {cred.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { Flame, Copy, Check, X, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export function OneTimeSecretModal({ isOpen, onClose, onHaptic }) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.createSecret({
        content,
        title: title || 'Конфиденциальный пароль / секрет',
        burnAfterRead: true,
        ttlMinutes: 120
      });

      const fullUrl = `${window.location.origin}/secret/${res.secretId}`;
      setGeneratedLink(fullUrl);
      onHaptic?.notification('success');
    } catch (err) {
      alert('Ошибка генерации секрета: ' + err.message);
      onHaptic?.notification('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    onHaptic?.impact('medium');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setContent('');
    setTitle('');
    setGeneratedLink('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">One-Time Secret (Burn on Read)</h3>
              <p className="text-[11px] text-slate-400">Одноразовая ссылка на секрет/пароль</p>
            </div>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Название или назначение (необязательно)
              </label>
              <input
                type="text"
                placeholder="Например: Доступ к базе данных для клиента"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Секретный текст / Пароль / Токен <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Вставьте пароль, SSH-ключ или конфигурацию..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-300">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Ссылка самоуничтожится (сгорит) сразу же после 1-го открытия получателем или через 2 часа.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              {isLoading ? 'Шифрование...' : 'Сгенерировать ссылку'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-sm font-bold text-white">Ссылка готова!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Отправьте эту ссылку клиенту или коллеге. После первого просмотра она навсегда исчезнет.
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-cyan-300 truncate">
                {generatedLink}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg shrink-0 transition-colors"
                title="Скопировать"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold"
            >
              Создать еще один секрет
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

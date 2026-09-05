import React from 'react';
import { X, Download, Trash2, Video, Image as ImageIcon } from 'lucide-react';

export function MediaPlayerModal({ item, onClose, onDelete, onHaptic }) {
  if (!item) return null;

  const isVideo = item.type === 'video' || item.mimeType?.startsWith('video/');

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
      onHaptic?.notification('warning');
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-3xl p-4 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            {isVideo ? (
              <Video className="w-5 h-5 text-cyan-400 shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate">
                {item.caption || item.originalName}
              </h3>
              <p className="text-[11px] text-slate-400">
                {new Date(item.createdAt).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={item.url}
              download={item.originalName}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors"
              title="Скачать файл"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={handleDelete}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/60 rounded-2xl p-2 min-h-[300px]">
          {isVideo ? (
            <video
              src={item.url}
              controls
              autoPlay
              className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
          ) : (
            <img
              src={item.url}
              alt={item.caption}
              className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
          )}
        </div>

        {/* Footer info */}
        {item.caption && (
          <div className="pt-3 text-xs text-slate-300">
            <span className="font-semibold text-cyan-400">Описание: </span>
            {item.caption}
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { 
  Film, 
  Upload, 
  Play, 
  Image as ImageIcon, 
  FileVideo, 
  Calendar, 
  Tag,
  Trash2 
} from 'lucide-react';
import { api } from '../services/api';

export function MediaView({ 
  media, 
  projects, 
  onSelectMedia, 
  onDeleteMedia,
  onRefresh, 
  onHaptic 
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'image' | 'video'
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploadProjectId, setUploadProjectId] = useState(projects[0]?.id || '');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    onHaptic?.impact('medium');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', uploadProjectId);
      formData.append('caption', caption.trim() || file.name);

      await api.uploadMedia(formData);
      onHaptic?.notification('success');
      setCaption('');
      onRefresh();
    } catch (err) {
      alert('Ошибка при загрузке медиа: ' + err.message);
      onHaptic?.notification('error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filtered = media.filter(item => {
    const matchesProject = selectedProjectId === 'all' || item.projectId === selectedProjectId;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesProject && matchesType;
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* Top Upload Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              Медиатека (Фото & Видео)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Скриншоты багов, ТЗ, видео-инструкции по проектам
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Загрузка...' : 'Загрузить'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Quick upload options & filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            placeholder="Описание к следующему файлу..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />

          <select
            value={uploadProjectId}
            onChange={(e) => setUploadProjectId(e.target.value)}
            className="w-full bg-cyber-850 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>К проекту: {p.name}</option>
            ))}
          </select>

          <div className="flex bg-white/5 p-1 rounded-xl">
            {['all', 'image', 'video'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  filterType === t ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'Все' : t === 'image' ? 'Фото' : 'Видео'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-white/5">
          <p className="text-sm">В медиатеке пока нет файлов.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-xs text-cyan-400 underline font-semibold"
          >
            Загрузить первое фото или видео
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const isVideo = item.type === 'video';
            const project = projects.find(p => p.id === item.projectId);

            return (
              <div
                key={item.id}
                onClick={() => {
                  onHaptic?.impact('light');
                  onSelectMedia(item);
                }}
                className="group relative rounded-2xl glass-panel hover:glass-panel-glow border border-white/10 overflow-hidden cursor-pointer flex flex-col transition-all aspect-square"
              >
                {/* Thumbnail / Media Container */}
                <div className="w-full h-full bg-black/50 flex items-center justify-center relative overflow-hidden">
                  {isVideo ? (
                    <div className="flex flex-col items-center justify-center">
                      <video
                        src={item.url}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
                      />
                      <div className="relative z-10 w-10 h-10 rounded-full bg-cyan-500/80 text-black flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-black" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={item.url}
                        alt={item.caption}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement?.querySelector('.img-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="img-fallback hidden w-full h-full items-center justify-center bg-slate-900 text-slate-500 flex-col gap-1 p-2 text-center">
                        <ImageIcon className="w-8 h-8 opacity-30 text-cyan-400" />
                        <span className="text-[10px] text-slate-400">Файл удален</span>
                      </div>
                    </>
                  )}

                  {/* Type badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold uppercase text-white flex items-center gap-1">
                    {isVideo ? <FileVideo className="w-2.5 h-2.5 text-cyan-400" /> : <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />}
                    {isVideo ? 'ВИДЕО' : 'ФОТО'}
                  </span>

                  {/* Direct Delete button on card */}
                  {onDeleteMedia && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Удалить файл "${item.caption || item.originalName}"?`)) {
                          onHaptic?.notification('warning');
                          onDeleteMedia(item.id);
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-slate-300 hover:text-white backdrop-blur-md transition-all z-20 shadow"
                      title="Удалить файл"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Caption overlay on bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 pt-6 flex flex-col justify-end">
                  <span className="text-xs font-semibold text-white truncate drop-shadow">
                    {item.caption || item.originalName}
                  </span>
                  <span className="text-[10px] text-cyan-400 truncate">
                    {project ? project.name : 'Общий'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

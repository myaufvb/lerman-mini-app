import React, { useState, useRef } from 'react';
import { Image, Upload, Sliders, Check, X, Sparkles, Video } from 'lucide-react';
import { api } from '../services/api';

export const PRESET_WALLPAPERS = [
  {
    id: 'wp-cyber-grid',
    name: 'Cyberpunk Matrix',
    type: 'gradient',
    css: 'radial-gradient(circle at 50% 20%, #0d1b2a 0%, #050811 100%)',
    preview: 'linear-gradient(135deg, #0d1b2a, #050811)'
  },
  {
    id: 'wp-neon-glow',
    name: 'Neon Blue Cyber',
    type: 'gradient',
    css: 'linear-gradient(135deg, #070e20 0%, #0a192f 50%, #020c1b 100%)',
    preview: 'linear-gradient(135deg, #070e20, #0a192f)'
  },
  {
    id: 'wp-dark-obsidian',
    name: 'Deep Obsidian',
    type: 'gradient',
    css: 'radial-gradient(ellipse at bottom, #111827 0%, #030712 100%)',
    preview: 'linear-gradient(135deg, #111827, #030712)'
  },
  {
    id: 'wp-emerald-sec',
    name: 'Emerald Security',
    type: 'gradient',
    css: 'linear-gradient(135deg, #061f1a 0%, #03120f 50%, #010807 100%)',
    preview: 'linear-gradient(135deg, #061f1a, #03120f)'
  },
  {
    id: 'wp-cyber-purple',
    name: 'Royal Violet',
    type: 'gradient',
    css: 'linear-gradient(135deg, #18092e 0%, #0e051b 50%, #05010a 100%)',
    preview: 'linear-gradient(135deg, #18092e, #0e051b)'
  }
];

export function WallpaperSelectorModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsUpdate, 
  onHaptic 
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'glass'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSelectPreset = async (preset) => {
    onHaptic?.impact('light');
    const updates = {
      activeWallpaperId: preset.id,
      customWallpaperUrl: '',
      customWallpaperType: 'gradient'
    };
    onSettingsUpdate(updates);
    await api.updateSettings(updates);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    onHaptic?.impact('medium');

    try {
      const formData = new FormData();
      formData.append('wallpaper', file);
      const res = await api.uploadWallpaper(formData);
      
      onHaptic?.notification('success');
      onSettingsUpdate({
        activeWallpaperId: res.wallpaper.id,
        customWallpaperUrl: res.wallpaper.url,
        customWallpaperType: res.wallpaper.type
      });
      setActiveTab('presets');
    } catch (err) {
      alert('Ошибка при загрузке файла: ' + err.message);
      onHaptic?.notification('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSliderChange = async (key, val) => {
    const num = Number(val);
    onSettingsUpdate({ [key]: num });
    await api.updateSettings({ [key]: num });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Кастомизация фона и обоев</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Коллекция
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Загрузить свое
          </button>
          <button
            onClick={() => setActiveTab('glass')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'glass'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Стекло & Блюр
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Выберите тему кибер-градиента или загруженные обои:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_WALLPAPERS.map((wp) => {
                const isSelected = settings.activeWallpaperId === wp.id && !settings.customWallpaperUrl;
                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectPreset(wp)}
                    className={`relative rounded-2xl p-3 cursor-pointer border transition-all h-24 flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ background: wp.preview }}
                  >
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {wp.name}
                    </span>
                    {isSelected && (
                      <div className="self-end w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom wallpaper indicator if set */}
            {settings.customWallpaperUrl && (
              <div className="mt-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.customWallpaperType === 'video' ? (
                    <Video className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Image className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-xs text-white font-medium">Активны ваши кастомные обои</span>
                </div>
                <button
                  onClick={() => handleSelectPreset(PRESET_WALLPAPERS[0])}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload custom image or video */}
        {activeTab === 'upload' && (
          <div className="space-y-4 text-center py-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cyan-500/5 hover:bg-cyan-500/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Выберите фото или живые видео-обои
              </h4>
              <p className="text-xs text-slate-400 max-w-[240px]">
                Поддерживаются JPG, PNG, WEBP, а также MP4/WEBM видео-зацикливание
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {isUploading && (
              <p className="text-xs text-cyan-400 animate-pulse font-semibold">
                Загрузка и оптимизация файла...
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Glassmorphism settings */}
        {activeTab === 'glass' && (
          <div className="space-y-5 py-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Прозрачность карточек (Glass Opacity)</span>
                <span className="text-cyan-400">{settings.cardOpacity}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={settings.cardOpacity}
                onChange={(e) => handleSliderChange('cardOpacity', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Размытие заднего фона (Backdrop Blur)</span>
                <span className="text-cyan-400">{settings.glassBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={settings.glassBlur}
                onChange={(e) => handleSliderChange('glassBlur', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              * Настройки применяются мгновенно ко всем панелям и карточкам приложения.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

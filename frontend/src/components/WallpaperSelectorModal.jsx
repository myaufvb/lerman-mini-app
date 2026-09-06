import React, { useState, useRef } from 'react';
import { Image, Upload, Sliders, Check, X, Sparkles, Video, Link, Play, RefreshCw, Zap, Shield } from 'lucide-react';
import { api } from '../services/api';

export const PRESET_LIVE_WALLPAPERS = [
  {
    id: 'live-matrix-rain',
    name: 'Матрица (Цифровой дождь)',
    subtitle: '60 FPS Canvas • Неоновый поток кода',
    type: 'live-canvas',
    mode: 'matrix',
    badge: '⚡ 60 FPS',
    color: '#00f2fe',
    previewGradient: 'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.25) 0%, #050b14 100%)'
  },
  {
    id: 'live-cyber-grid',
    name: 'Кибер-Сетка 3D (Горизонт)',
    subtitle: '60 FPS Canvas • Неоновая перспектива',
    type: 'live-canvas',
    mode: 'grid',
    badge: '⚡ 60 FPS',
    color: '#818cf8',
    previewGradient: 'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.25) 0%, #050811 100%)'
  },
  {
    id: 'live-particles',
    name: 'Нейросеть (Узлы защиты)',
    subtitle: '60 FPS Canvas • Соединенные дата-пакеты',
    type: 'live-canvas',
    mode: 'particles',
    badge: '⚡ 60 FPS',
    color: '#34d399',
    previewGradient: 'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.25) 0%, #060b17 100%)'
  }
];

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
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'url' | 'upload' | 'gradients' | 'glass'
  const [isUploading, setIsUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [urlType, setUrlType] = useState('video'); // 'video' | 'image'
  const [urlError, setUrlError] = useState('');
  const [urlSuccess, setUrlSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  if (!isOpen) return null;

  // 1. Select Live Canvas Wallpaper
  const handleSelectLiveCanvas = async (liveItem) => {
    onHaptic?.impact('medium');
    const updates = {
      activeWallpaperId: liveItem.id,
      customWallpaperUrl: '',
      customWallpaperType: 'live-canvas'
    };
    onSettingsUpdate(updates);
    try {
      await api.updateSettings(updates);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // 2. Select Static Gradient Preset
  const handleSelectGradient = async (preset) => {
    onHaptic?.impact('light');
    const updates = {
      activeWallpaperId: preset.id,
      customWallpaperUrl: '',
      customWallpaperType: 'gradient'
    };
    onSettingsUpdate(updates);
    try {
      await api.updateSettings(updates);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // 3. Add Wallpaper by URL
  const handleApplyUrl = async (e) => {
    e?.preventDefault();
    if (!inputUrl.trim()) {
      setUrlError('Введите прямую ссылку на видео или картинку');
      return;
    }
    setUrlError('');
    setUrlSuccess('');
    setIsUploading(true);
    onHaptic?.impact('medium');

    try {
      const isVideo = urlType === 'video' || Boolean(inputUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i));
      const res = await api.addWallpaperByUrl({
        url: inputUrl.trim(),
        name: isVideo ? 'Живые видео-обои (URL)' : 'Кастомный фон (URL)',
        type: isVideo ? 'video' : 'image'
      });

      onHaptic?.notification('success');
      setUrlSuccess('Живые обои успешно установлены!');
      onSettingsUpdate({
        activeWallpaperId: res.wallpaper.id,
        customWallpaperUrl: res.wallpaper.url,
        customWallpaperType: res.wallpaper.type
      });
      setTimeout(() => setUrlSuccess(''), 3000);
    } catch (err) {
      setUrlError(err.message || 'Не удалось применить ссылку');
      onHaptic?.notification('error');
    } finally {
      setIsUploading(false);
    }
  };

  // 4. File Upload (MP4 / WebM / Images)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('Размер файла не должен превышать 100 МБ');
      return;
    }

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
      alert('Обои успешно загружены и применены!');
    } catch (err) {
      alert('Ошибка при загрузке файла: ' + err.message);
      onHaptic?.notification('error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 5. Reset to standard
  const handleResetToDefault = async () => {
    onHaptic?.impact('light');
    const updates = {
      activeWallpaperId: 'live-matrix-rain',
      customWallpaperUrl: '',
      customWallpaperType: 'live-canvas'
    };
    onSettingsUpdate(updates);
    await api.updateSettings(updates);
  };

  // 6. Glass & Blur adjustment
  const handleSliderChange = async (key, val) => {
    const num = Number(val);
    onSettingsUpdate({ [key]: num });
    await api.updateSettings({ [key]: num });
  };

  const isLiveCanvasActive = settings.activeWallpaperId?.startsWith('live-') && !settings.customWallpaperUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto border border-cyan-500/30 shadow-2xl shadow-cyan-950/50">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Живые обои и кастомизация
              </h3>
              <p className="text-[11px] text-slate-400">Интерактивный 60 FPS фон, видео и темы</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Wallpaper Status Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {settings.customWallpaperType === 'video' ? (
              <Video className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : isLiveCanvasActive ? (
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Image className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {settings.customWallpaperUrl
                  ? settings.customWallpaperType === 'video'
                    ? '🎬 Активны: Живые видео-обои'
                    : '🖼️ Активны: Пользовательское фото'
                  : settings.activeWallpaperId === 'live-matrix-rain'
                  ? '⚡ Активна: Матрица (Цифровой дождь)'
                  : settings.activeWallpaperId === 'live-cyber-grid'
                  ? '⚡ Активна: Кибер-Сетка 3D'
                  : settings.activeWallpaperId === 'live-particles'
                  ? '⚡ Активна: Нейросеть данных'
                  : '🎨 Активен: Кибер-градиент'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {settings.customWallpaperUrl || settings.activeWallpaperId}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetToDefault}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all shrink-0"
          >
            Сброс
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-2xl mb-4 text-[11px] font-semibold text-center">
          <button
            onClick={() => setActiveTab('live')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'live'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Живые
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'url'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔗 Ссылка
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📁 Файл
          </button>
          <button
            onClick={() => setActiveTab('gradients')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'gradients'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎨 Темы
          </button>
          <button
            onClick={() => setActiveTab('glass')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'glass'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ Блюр
          </button>
        </div>

        {/* TAB 1: LIVE WALLPAPERS (CANVAS 60 FPS) */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Интерактивные живые фоны (60 FPS):
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">0 МБ • Без тормозов</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_LIVE_WALLPAPERS.map((live) => {
                const isSelected = settings.activeWallpaperId === live.id && !settings.customWallpaperUrl;
                return (
                  <div
                    key={live.id}
                    onClick={() => handleSelectLiveCanvas(live)}
                    className={`relative rounded-2xl p-3.5 cursor-pointer border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-950/40 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 hover:border-cyan-500/40 bg-slate-900/60'
                    }`}
                    style={{ background: live.previewGradient }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black shadow-md"
                        style={{ background: live.color }}
                      >
                        <Zap className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{live.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            {live.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{live.subtitle}</p>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold shadow-md shadow-cyan-400/50">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <button className="text-[11px] font-semibold text-cyan-400 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20">
                        Включить
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">💡 Как работают живые фоны:</p>
              <p>Они рендерятся напрямую через HTML5 Canvas вашего устройства, потребляют минимум батареи и работают мгновенно без загрузки тяжелых видео.</p>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE URL (VIDEO / MP4 / WEBM / GIF) */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-200">
                Вставьте прямую ссылку на видео или анимацию:
              </label>
              <p className="text-[11px] text-slate-400">
                Поддерживаются любые прямые ссылки на .mp4, .webm, .gif или картинки
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com/cyber-loop.mp4"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-slate-900/80 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
                {inputUrl && (
                  <button
                    onClick={() => setInputUrl('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type toggle */}
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUrlType('video')}
                  className={`flex-1 py-1.5 rounded-lg border font-semibold transition-all ${
                    urlType === 'video'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  🎬 Живое видео (MP4 / WebM)
                </button>
                <button
                  type="button"
                  onClick={() => setUrlType('image')}
                  className={`flex-1 py-1.5 rounded-lg border font-semibold transition-all ${
                    urlType === 'image'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  🖼️ Картинка / GIF
                </button>
              </div>
            </div>

            {/* Quick Presets for test */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Готовые онлайн видео-лупы:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('https://assets.mixkit.co/videos/preview/mixkit-matrix-style-code-screen-animation-39749-large.mp4');
                    setUrlType('video');
                  }}
                  className="p-2 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/20 text-left text-[11px] text-slate-300 hover:text-cyan-400 transition-all"
                >
                  <p className="font-bold">⚡ Matrix Loop</p>
                  <p className="text-[9px] text-slate-400 font-mono">mixkit-code.mp4</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                    setUrlType('video');
                  }}
                  className="p-2 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/20 text-left text-[11px] text-slate-300 hover:text-cyan-400 transition-all"
                >
                  <p className="font-bold">🌐 Cyber Blaze Loop</p>
                  <p className="text-[9px] text-slate-400 font-mono">google-sample.mp4</p>
                </button>
              </div>
            </div>

            {urlError && (
              <p className="text-xs text-rose-400 font-semibold">{urlError}</p>
            )}
            {urlSuccess && (
              <p className="text-xs text-emerald-400 font-semibold">{urlSuccess}</p>
            )}

            <button
              onClick={handleApplyUrl}
              disabled={isUploading || !inputUrl}
              className="w-full py-3 rounded-2xl cyber-button font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Применение фона...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Применить живые обои по ссылке
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: UPLOAD FROM DEVICE */}
        {activeTab === 'upload' && (
          <div className="space-y-4 py-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-cyan-500/5 hover:bg-cyan-500/10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                Выберите видео или фото с устройства
              </h4>
              <p className="text-[11px] text-slate-400 max-w-[260px] leading-relaxed">
                Поддерживаются MP4, WEBM, MOV, а также JPG, PNG, WEBP (до 100 МБ)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs text-cyan-400 font-semibold">
                  Загрузка и оптимизация видео...
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STATIC GRADIENT PRESETS */}
        {activeTab === 'gradients' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Энергоэффективные темные темы и градиенты:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_WALLPAPERS.map((wp) => {
                const isSelected = settings.activeWallpaperId === wp.id && !settings.customWallpaperUrl;
                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectGradient(wp)}
                    className={`relative rounded-2xl p-3 cursor-pointer border transition-all h-20 flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ background: wp.preview }}
                  >
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {wp.name}
                    </span>
                    {isSelected && (
                      <div className="self-end w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: GLASS & BLUR SETTINGS */}
        {activeTab === 'glass' && (
          <div className="space-y-5 py-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Прозрачность карточек (Glass Opacity)</span>
                <span className="text-cyan-400 font-mono">{settings.cardOpacity}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="95"
                value={settings.cardOpacity}
                onChange={(e) => handleSliderChange('cardOpacity', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Стеклянный (35%)</span>
                <span>Плотный (95%)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Размытие заднего фона (Backdrop Blur)</span>
                <span className="text-cyan-400 font-mono">{settings.glassBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={settings.glassBlur}
                onChange={(e) => handleSliderChange('glassBlur', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Четкий (0px)</span>
                <span>Максимальный блюр (30px)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-white/5 p-3 rounded-2xl border border-white/5">
              * Все изменения применяются в реальном времени ко всем блокам, кнопкам и графикам приложения.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}


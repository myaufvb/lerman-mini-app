import React, { useState } from 'react';
import { 
  Sliders, 
  Lock, 
  Image, 
  Bell, 
  Bot, 
  ShieldCheck, 
  Smartphone, 
  Cpu, 
  Check 
} from 'lucide-react';
import { api } from '../services/api';

export function SettingsView({ 
  settings, 
  onSettingsUpdate, 
  onOpenWallpaperModal, 
  onHaptic 
}) {
  const handleToggleNotifications = async () => {
    const nextVal = !settings.notificationsEnabled;
    onHaptic?.impact('light');
    onSettingsUpdate({ notificationsEnabled: nextVal });
    await api.updateSettings({ notificationsEnabled: nextVal });
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-black text-white">
            Настройки & Безопасность
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Управление внешним видом, оповещениями и профилем
        </p>
      </div>

      {/* Wallpaper & Glass Customizer Button Card */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Кастомные обои и темы</h3>
              <p className="text-xs text-slate-400">Живые видео-обои, фото из галереи или кибер-сетки</p>
            </div>
          </div>
          <button
            onClick={onOpenWallpaperModal}
            className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-bold transition-colors"
          >
            Настроить
          </button>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Размытие: {settings.glassBlur}px • Прозрачность: {settings.cardOpacity}%</span>
          <span className="text-cyan-400 font-mono text-[11px]">
            {settings.customWallpaperUrl ? 'Кастомный фон активен' : settings.activeWallpaperId}
          </span>
        </div>
      </div>

      {/* Telegram Notifications */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Push-уведомления</h3>
              <p className="text-xs text-slate-400">Мгновенные алерты в Telegram о тикетах и падениях</p>
            </div>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.notificationsEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* System info */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-2 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>Служба мониторинга</span>
          <span className="text-emerald-400 font-mono">Активна (60s)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Шифрование паролей</span>
          <span className="text-cyan-400 font-mono">AES-256-GCM</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Платформа</span>
          <span className="text-slate-300 font-mono">Telegram WebApp & Web</span>
        </div>
      </div>

    </div>
  );
}

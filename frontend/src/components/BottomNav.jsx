import React from 'react';
import { 
  Activity, 
  KeyRound, 
  Film, 
  MessageSquareWarning, 
  Cpu, 
  Sliders 
} from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, unreadTicketsCount, offlineProjectsCount, onHaptic }) {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Проекты',
      icon: Activity,
      badge: offlineProjectsCount > 0 ? offlineProjectsCount : null,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'vault',
      label: 'Пароли',
      icon: KeyRound
    },
    {
      id: 'media',
      label: 'Медиа',
      icon: Film
    },
    {
      id: 'tickets',
      label: 'Поддержка',
      icon: MessageSquareWarning,
      badge: unreadTicketsCount > 0 ? unreadTicketsCount : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'integration',
      label: 'Интеграция',
      icon: Cpu
    },
    {
      id: 'settings',
      label: 'Опции',
      icon: Sliders
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="glass-panel rounded-2xl p-1.5 flex items-center justify-around border border-white/10 shadow-2xl backdrop-blur-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onHaptic?.();
                  setActiveTab(tab.id);
                }}
                className={`relative flex flex-col items-center py-1.5 px-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/20 text-cyan-400 font-semibold shadow-inner border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-400' : ''}`} />
                  {tab.badge && (
                    <span className={`absolute -top-1.5 -right-2 w-4 h-4 rounded-full ${tab.badgeColor} text-[10px] font-bold text-white flex items-center justify-center animate-pulse`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

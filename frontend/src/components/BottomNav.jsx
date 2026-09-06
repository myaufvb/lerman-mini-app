import React, { useState, useRef, useEffect } from 'react';
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

  const activeIndex = Math.max(0, tabs.findIndex(t => t.id === activeTab));
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(activeIndex);
  const [stretch, setStretch] = useState({ x: 1, y: 1 });
  const [tabWidth, setTabWidth] = useState(0);

  // Measure tab dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // 6 tabs inside padding (p-1.5 = 6px each side, total 12px)
        const innerWidth = rect.width - 12;
        setTabWidth(innerWidth / tabs.length);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [tabs.length]);

  // Sync hoverIndex with activeIndex when not dragging
  useEffect(() => {
    if (!isDragging) {
      setHoverIndex(activeIndex);
    }
  }, [activeIndex, isDragging]);

  // Pointer gesture handlers for dragging the liquid glass bubble
  const handlePointerDown = (e) => {
    if (!containerRef.current || tabWidth <= 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left - 6;
    const clampedX = Math.min(Math.max(0, currentX - tabWidth / 2), (tabs.length - 1) * tabWidth);

    setIsDragging(true);
    setDragX(clampedX);
    setStretch({ x: 1.12, y: 0.94 });

    const newIndex = Math.min(Math.max(0, Math.floor(currentX / tabWidth)), tabs.length - 1);
    if (newIndex !== hoverIndex) {
      setHoverIndex(newIndex);
      onHaptic?.();
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current || tabWidth <= 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left - 6;
    const clampedX = Math.min(Math.max(0, currentX - tabWidth / 2), (tabs.length - 1) * tabWidth);

    setDragX(clampedX);

    const newIndex = Math.min(Math.max(0, Math.floor(currentX / tabWidth)), tabs.length - 1);
    if (newIndex !== hoverIndex) {
      setHoverIndex(newIndex);
      onHaptic?.();
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    setIsDragging(false);
    setStretch({ x: 1, y: 1 });

    if (hoverIndex >= 0 && hoverIndex < tabs.length) {
      if (tabs[hoverIndex].id !== activeTab) {
        setActiveTab(tabs[hoverIndex].id);
        onHaptic?.();
      }
    }
  };

  // Compute bubble transform
  const bubbleOffset = isDragging ? dragX : activeIndex * tabWidth;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none select-none animate-ios-slide-up">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="apple-liquid-panel rounded-3xl p-1.5 flex items-center relative overflow-hidden touch-none cursor-grab active:cursor-grabbing transition-shadow hover:shadow-cyan-500/10"
        >
          {/* LIQUID GLASS SLIDING BUBBLE / CAPSULE */}
          {tabWidth > 0 && (
            <div
              className="apple-liquid-bubble absolute top-1.5 bottom-1.5 rounded-2xl pointer-events-none will-change-transform z-0"
              style={{
                width: `${tabWidth}px`,
                transform: `translateX(${bubbleOffset}px) scaleX(${stretch.x}) scaleY(${stretch.y})`,
                transition: isDragging 
                  ? 'none' 
                  : 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.25)'
              }}
            >
              {/* Inner specular glossy highlight */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-cyan-400/10 to-white/20 pointer-events-none" />
            </div>
          )}

          {/* TAB BUTTONS */}
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHovered = isDragging && hoverIndex === idx;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onHaptic?.();
                  setActiveTab(tab.id);
                }}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 z-10 ${
                  isActive || isHovered
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive || isHovered
                        ? 'scale-110 text-cyan-300 drop-shadow-[0_0_10px_rgba(0,242,254,0.7)] stroke-[2.4]'
                        : 'stroke-[1.8]'
                    }`} 
                  />
                  {tab.badge && (
                    <span className={`absolute -top-1.5 -right-2 px-1 min-w-[15px] h-3.5 rounded-full ${tab.badgeColor} text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse`}>
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span 
                  className={`text-[10px] mt-1 tracking-tight font-medium transition-all duration-200 ${
                    isActive || isHovered 
                      ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] scale-105' 
                      : 'text-slate-400 text-opacity-80'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* iPhone Home Indicator line */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2 backdrop-blur-sm" />
      </div>
    </nav>
  );
}


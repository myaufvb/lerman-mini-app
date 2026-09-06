import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CyberCanvasWallpaper } from './components/CyberCanvasWallpaper';

// Views
import { DashboardView } from './pages/DashboardView';
import { VaultView } from './pages/VaultView';
import { MediaView } from './pages/MediaView';
import { TicketsView } from './pages/TicketsView';
import { IntegrationView } from './pages/IntegrationView';
import { SettingsView } from './pages/SettingsView';
import { AuthView } from './pages/AuthView';

// Modals
import { WallpaperSelectorModal, PRESET_WALLPAPERS, PRESET_LIVE_WALLPAPERS } from './components/WallpaperSelectorModal';
import { OneTimeSecretModal } from './components/OneTimeSecretModal';
import { MediaPlayerModal } from './components/MediaPlayerModal';
import { NewProjectModal } from './components/NewProjectModal';
import { NewCredModal } from './components/NewCredModal';
import { NewTicketModal } from './components/NewTicketModal';

export default function App() {
  const { user, isInsideTelegram, haptic } = useTelegram();

  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lerman_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (userData, token) => {
    setCurrentUser(userData);
    localStorage.setItem('lerman_user', JSON.stringify(userData));
    localStorage.setItem('lerman_token', token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lerman_user');
    localStorage.removeItem('lerman_token');
  };

  // App Data State
  const [projects, setProjects] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [media, setMedia] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [settings, setSettings] = useState({
    activeWallpaperId: 'wp-cyber-grid',
    customWallpaperUrl: '',
    customWallpaperType: 'gradient',
    glassBlur: 16,
    cardOpacity: 85,
    hasMasterPin: false,
    notificationsEnabled: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals State
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isOneTimeSecretModalOpen, setIsOneTimeSecretModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewCredModalOpen, setIsNewCredModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projRes, credRes, medRes, tktRes, setRes] = await Promise.all([
        api.getProjects().catch(() => ({ projects: [] })),
        api.getVault().catch(() => ({ credentials: [] })),
        api.getMedia().catch(() => ({ media: [] })),
        api.getTickets().catch(() => ({ tickets: [] })),
        api.getSettings().catch(() => ({ settings: null }))
      ]);

      setProjects(projRes.projects || []);
      setCredentials(credRes.credentials || []);
      setMedia(medRes.media || []);
      setTickets(tktRes.tickets || []);
      if (setRes.settings) {
        setSettings(prev => ({ ...prev, ...setRes.settings }));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-poll status every 25 seconds
    const interval = setInterval(loadData, 25000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSettingsUpdate = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleDeleteMedia = async (id) => {
    try {
      await api.deleteMedia(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && settings.customWallpaperType === 'video') {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => {
        console.warn('Autoplay prevented:', err);
      });
    }
  }, [settings.customWallpaperUrl, settings.customWallpaperType]);

  const activePreset = PRESET_WALLPAPERS.find(p => p.id === settings.activeWallpaperId) || PRESET_WALLPAPERS[0];
  const unreadTickets = tickets.filter(t => t.status === 'new').length;
  const offlineProjects = projects.filter(p => p.status === 'offline').length;

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col relative transition-colors duration-300 bg-[#050914]"
      style={{
        '--glass-blur': `${settings.glassBlur || 16}px`,
        '--card-opacity': `${(settings.cardOpacity || 85) / 100}`
      }}
    >
      {/* BACKGROUND WALLPAPERS LAYER (Fixed, pointer-events-none, z-0) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* 1. Live Canvas Wallpapers */}
        {settings.activeWallpaperId === 'live-matrix-rain' && <CyberCanvasWallpaper mode="matrix" />}
        {settings.activeWallpaperId === 'live-cyber-grid' && <CyberCanvasWallpaper mode="grid" />}
        {settings.activeWallpaperId === 'live-particles' && <CyberCanvasWallpaper mode="particles" />}

        {/* 2. Live Video Wallpaper (Uploaded file or Direct URL) */}
        {settings.customWallpaperUrl && settings.customWallpaperType === 'video' && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            onLoadedMetadata={(e) => {
              e.target.muted = true;
              e.target.play().catch(() => {});
            }}
            className="w-full h-full object-cover"
            src={settings.customWallpaperUrl}
          />
        )}

        {/* 3. Custom Image Wallpaper */}
        {settings.customWallpaperUrl && settings.customWallpaperType === 'image' && (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${settings.customWallpaperUrl})` }}
          />
        )}

        {/* 4. Static Gradient Wallpaper fallback */}
        {!settings.customWallpaperUrl && !settings.activeWallpaperId?.startsWith('live-') && (
          <div
            className="w-full h-full"
            style={{ background: activePreset?.css || PRESET_WALLPAPERS[0].css }}
          />
        )}

        {/* 5. Cyber Darkening Contrast Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]" />

        {/* 6. Cyber Grid Dot Texture */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 242, 254, 0.2) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* FOREGROUND APPLICATION CONTENT (Relative, z-10) */}
      <div className="relative z-10 flex-1 flex flex-col animate-ios-entrance">
        {!currentUser ? (
          <AuthView onLoginSuccess={handleLoginSuccess} onHaptic={haptic} />
        ) : (
          <>
            {/* Top Navbar */}
            <Navbar
              user={user}
              currentUser={currentUser}
              onLogout={handleLogout}
              isInsideTelegram={isInsideTelegram}
              onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
              onRefresh={loadData}
              isLoading={isLoading}
            />

            {/* Main Content Area with fluid iOS Tab transition */}
            <main key={activeTab} className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 animate-tab-switch">
              {activeTab === 'dashboard' && (
                <DashboardView
                  projects={projects}
                  currentUser={currentUser}
                  onRefresh={loadData}
                  onOpenNewProject={() => setIsNewProjectModalOpen(true)}
                  onSelectProject={() => {}}
                  onHaptic={haptic}
                />
              )}

              {activeTab === 'vault' && (
                <VaultView
                  credentials={credentials}
                  projects={projects}
                  currentUser={currentUser}
                  onOpenNewCred={() => setIsNewCredModalOpen(true)}
                  onOpenOneTimeSecret={() => setIsOneTimeSecretModalOpen(true)}
                  onRefresh={loadData}
                  onHaptic={haptic}
                />
              )}

              {activeTab === 'media' && (
                <MediaView
                  media={media}
                  projects={projects}
                  currentUser={currentUser}
                  onSelectMedia={(item) => setSelectedMedia(item)}
                  onDeleteMedia={handleDeleteMedia}
                  onRefresh={loadData}
                  onHaptic={haptic}
                />
              )}

              {activeTab === 'tickets' && (
                <TicketsView
                  tickets={tickets}
                  projects={projects}
                  currentUser={currentUser}
                  onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
                  onRefresh={loadData}
                  onHaptic={haptic}
                />
              )}

              {activeTab === 'integration' && (
                <IntegrationView
                  projects={projects}
                  currentUser={currentUser}
                  onHaptic={haptic}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onSettingsUpdate={handleSettingsUpdate}
                  onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
                  onHaptic={haptic}
                />
              )}
            </main>

            {/* Floating Bottom Nav */}
            <BottomNav
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              unreadTicketsCount={unreadTickets}
              offlineProjectsCount={offlineProjects}
              onHaptic={() => haptic.selection()}
            />
          </>
        )}
      </div>

      {/* Modals */}

      <WallpaperSelectorModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        settings={settings}
        onSettingsUpdate={handleSettingsUpdate}
        onHaptic={haptic}
      />

      <OneTimeSecretModal
        isOpen={isOneTimeSecretModalOpen}
        onClose={() => setIsOneTimeSecretModalOpen(false)}
        onHaptic={haptic}
      />

      <MediaPlayerModal
        item={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onDelete={handleDeleteMedia}
        onHaptic={haptic}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreated={() => loadData()}
        onHaptic={haptic}
      />

      <NewCredModal
        isOpen={isNewCredModalOpen}
        onClose={() => setIsNewCredModalOpen(false)}
        projects={projects}
        onCreated={() => loadData()}
        onHaptic={haptic}
      />

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        projects={projects}
        onCreated={() => loadData()}
        onHaptic={haptic}
      />
    </div>
  );
}

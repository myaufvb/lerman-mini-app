import React, { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';

// Views
import { DashboardView } from './pages/DashboardView';
import { VaultView } from './pages/VaultView';
import { MediaView } from './pages/MediaView';
import { TicketsView } from './pages/TicketsView';
import { IntegrationView } from './pages/IntegrationView';
import { SettingsView } from './pages/SettingsView';
import { AuthView } from './pages/AuthView';

// Modals
import { PinModal } from './components/PinModal';
import { WallpaperSelectorModal, PRESET_WALLPAPERS } from './components/WallpaperSelectorModal';
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
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  // Modals State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
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
        if (!setRes.settings.hasMasterPin) {
          setIsVaultUnlocked(true);
        }
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

  // Handle Tab Switch (check PIN for vault)
  const handleTabChange = (tabId) => {
    if (tabId === 'vault' && settings.hasMasterPin && !isVaultUnlocked) {
      setIsPinModalOpen(true);
    }
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

  // Background style computation
  const activePreset = PRESET_WALLPAPERS.find(p => p.id === settings.activeWallpaperId) || PRESET_WALLPAPERS[0];
  const backgroundStyle = settings.customWallpaperUrl
    ? settings.customWallpaperType === 'image'
      ? { backgroundImage: `url(${settings.customWallpaperUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}
    : { background: activePreset.css };

  const unreadTickets = tickets.filter(t => t.status === 'new').length;
  const offlineProjects = projects.filter(p => p.status === 'offline').length;

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col relative transition-colors duration-300"
      style={{
        ...backgroundStyle,
        '--glass-blur': `${settings.glassBlur || 16}px`,
        '--card-opacity': `${(settings.cardOpacity || 85) / 100}`
      }}
    >
      {/* Live Video Wallpaper if active */}
      {settings.customWallpaperUrl && settings.customWallpaperType === 'video' && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover -z-10 pointer-events-none"
          src={settings.customWallpaperUrl}
        />
      )}

      {/* Cyber Grid Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 opacity-30" 
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 242, 254, 0.1) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* If not authenticated, show AuthView */}
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
            hasMasterPin={settings.hasMasterPin}
            isVaultUnlocked={isVaultUnlocked}
            onLockVault={() => setIsVaultUnlocked(false)}
            onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
            onRefresh={loadData}
            isLoading={isLoading}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                projects={projects}
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
                isVaultUnlocked={isVaultUnlocked}
                hasMasterPin={settings.hasMasterPin}
                onRequestUnlock={() => setIsPinModalOpen(true)}
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
                onSelectMedia={(item) => setSelectedMedia(item)}
                onRefresh={loadData}
                onHaptic={haptic}
              />
            )}

            {activeTab === 'tickets' && (
              <TicketsView
                tickets={tickets}
                projects={projects}
                onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
                onRefresh={loadData}
                onHaptic={haptic}
              />
            )}

            {activeTab === 'integration' && (
              <IntegrationView
                projects={projects}
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

      {/* Modals */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerifySuccess={() => {
          setIsVaultUnlocked(true);
          setActiveTab('vault');
        }}
        onHaptic={haptic}
      />

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

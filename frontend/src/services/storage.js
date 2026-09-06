// Robust multi-tier storage service for browser & Telegram WebApp environments
// Prevents logout on page refresh or iframe sandboxing

const USER_KEY = 'lerman_user';
const TOKEN_KEY = 'lerman_token';

export const storageService = {
  // Synchronous read (localStorage -> sessionStorage fallback)
  getUser() {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
      try {
        const rawSession = sessionStorage.getItem(USER_KEY);
        if (rawSession) return JSON.parse(rawSession);
      } catch (_) {}
    }
    return null;
  },

  getToken() {
    try {
      if (typeof window === 'undefined') return '';
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
      try {
        return sessionStorage.getItem(TOKEN_KEY) || '';
      } catch (_) {}
      return '';
    }
  },

  // Save across all available storage engines
  saveSession(user, token = '') {
    if (!user) return;
    const userStr = JSON.stringify(user);

    // 1. LocalStorage
    try {
      localStorage.setItem(USER_KEY, userStr);
      if (token) localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
    }

    // 2. SessionStorage
    try {
      sessionStorage.setItem(USER_KEY, userStr);
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('sessionStorage.setItem failed:', e);
    }

    // 3. Telegram WebApp CloudStorage (persists across WebView restarts and devices)
    try {
      const tgCloud = window.Telegram?.WebApp?.CloudStorage;
      if (tgCloud && typeof tgCloud.setItem === 'function') {
        tgCloud.setItem(USER_KEY, userStr, (err) => {
          if (err) console.warn('Telegram CloudStorage setItem error:', err);
        });
        if (token) {
          tgCloud.setItem(TOKEN_KEY, token, () => {});
        }
      }
    } catch (e) {
      console.warn('Telegram CloudStorage write failed:', e);
    }
  },

  // Clear session from all storage engines
  clearSession() {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (_) {}

    try {
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (_) {}

    try {
      const tgCloud = window.Telegram?.WebApp?.CloudStorage;
      if (tgCloud && typeof tgCloud.removeItem === 'function') {
        tgCloud.removeItem(USER_KEY, () => {});
        tgCloud.removeItem(TOKEN_KEY, () => {});
      }
    } catch (_) {}
  },

  // Async restore from Telegram CloudStorage if local storage was cleared by Telegram WebView
  async restoreFromTelegramCloud() {
    return new Promise((resolve) => {
      try {
        const tgCloud = window.Telegram?.WebApp?.CloudStorage;
        if (!tgCloud || typeof tgCloud.getItem !== 'function') {
          return resolve(null);
        }

        tgCloud.getItem(USER_KEY, (err, userStr) => {
          if (err || !userStr) {
            return resolve(null);
          }
          try {
            const parsedUser = JSON.parse(userStr);
            tgCloud.getItem(TOKEN_KEY, (_tokenErr, tokenStr) => {
              resolve({
                user: parsedUser,
                token: tokenStr || ''
              });
            });
          } catch (parseErr) {
            resolve(null);
          }
        });
      } catch (e) {
        resolve(null);
      }
    });
  }
};

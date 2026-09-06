import { useEffect, useMemo } from 'react';

export function useTelegram() {
  const tg = useMemo(() => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp
      ? window.Telegram.WebApp
      : null;
  }, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();

      // Disable swipe-down gesture that closes the Mini App on Telegram iOS / Android
      try {
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
        if (typeof tg.enableClosingConfirmation === 'function') {
          tg.enableClosingConfirmation();
        }
      } catch (e) {
        // Ignored on older Telegram client versions
      }

      try {
        tg.setHeaderColor('#070b14');
        tg.setBackgroundColor('#070b14');
      } catch (e) {
        // Ignored on unsupported versions
      }
    }
  }, [tg]);

  const haptic = useMemo(() => ({
    impact: (style = 'medium') => {
      try {
        tg?.HapticFeedback?.impactOccurred(style);
      } catch (e) {}
    },
    notification: (type = 'success') => {
      try {
        tg?.HapticFeedback?.notificationOccurred(type);
      } catch (e) {}
    },
    selection: () => {
      try {
        tg?.HapticFeedback?.selectionChanged();
      } catch (e) {}
    }
  }), [tg]);

  const user = tg?.initDataUnsafe?.user || {
    id: 777123456,
    first_name: 'Лерман',
    username: 'lerman_admin',
    language_code: 'ru'
  };

  const isInsideTelegram = Boolean(tg?.initData);

  return {
    tg,
    user,
    isInsideTelegram,
    haptic,
    close: () => tg?.close()
  };
}

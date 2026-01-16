/**
 * Telegram WebApp Utility Functions
 * 
 * This file provides utilities for integrating with Telegram Mini Apps
 */

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (data: string) => boolean) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean, contact?: {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
  }) => void) => void;
  shareToStory: (mediaUrl: string, params?: {
    text?: string;
    widget_link?: {
      url: string;
      name?: string;
    };
  }) => void;
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

/**
 * Check if running inside Telegram
 */
export function isTelegramWebApp(): boolean {
  return getTelegramWebApp() !== null;
}

/**
 * Initialize Telegram WebApp
 */
export function initTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Set theme colors
    if (tg.themeParams.bg_color) {
      document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
    }
    if (tg.themeParams.text_color) {
      document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color);
    }
    
    console.log('[Telegram] WebApp initialized', {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      user: tg.initDataUnsafe.user,
    });
  }
}

/**
 * Get Telegram user info
 */
export function getTelegramUser() {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe.user || null;
}

/**
 * Show Telegram main button
 */
export function showMainButton(text: string, onClick: () => void): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  }
}

/**
 * Hide Telegram main button
 */
export function hideMainButton(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.MainButton.hide();
  }
}

/**
 * Show Telegram back button
 */
export function showBackButton(onClick: () => void): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.BackButton.onClick(onClick);
    tg.BackButton.show();
  }
}

/**
 * Hide Telegram back button
 */
export function hideBackButton(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.BackButton.hide();
  }
}

/**
 * Trigger haptic feedback
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'): void {
  const tg = getTelegramWebApp();
  if (tg) {
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg.HapticFeedback.notificationOccurred(type);
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  }
}

/**
 * Close Telegram WebApp
 */
export function closeTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
}

/**
 * Share score to Telegram
 */
export function shareScore(score: number, level: number): void {
  const tg = getTelegramWebApp();
  if (tg) {
    const message = `🎮 Block Blast'te ${score} puan yaptım! (Level ${level})\n\nSen de oynayabilirsin! 🚀`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`);
  }
}

/**
 * Get init data for backend authentication
 */
export function getTelegramInitData(): string {
  const tg = getTelegramWebApp();
  return tg?.initData || '';
}

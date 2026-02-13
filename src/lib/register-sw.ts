import { Platform } from 'react-native';

/**
 * Registers the service worker and injects the PWA manifest link on web.
 * No-op on native platforms.
 */
export async function registerServiceWorker() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return;

  // Inject manifest link (Expo metro auto-generates HTML, so we add it dynamically)
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }

  // Inject theme-color meta
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#4F46E5';
    document.head.appendChild(meta);
  }

  // Inject apple-mobile-web-app-capable meta for iOS PWA
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }

  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[SW] Registered:', registration.scope);
  } catch (err) {
    console.warn('[SW] Registration failed:', err);
  }
}

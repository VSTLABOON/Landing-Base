import { supabase } from './supabaseClient';
import { logger } from './logger';

const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Utility to convert the base64 public key to a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the service worker and subscribes the device to push notifications.
 * Saves the subscription object to Supabase associated with the user/tenant.
 */
export async function subscribeToPushNotifications(userId: string, tenantId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    logger.warn('Push messaging is not supported by this browser.');
    return false;
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      logger.info('Push notification permission denied.');
      return false;
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // 3. Subscribe to push manager
    if (!PUBLIC_VAPID_KEY) {
      throw new Error("Missing VITE_VAPID_PUBLIC_KEY in environment variables.");
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });

    // 4. Send subscription to server
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      tenant_id: tenantId,
      endpoint: subscription.endpoint,
      auth_key: subscription.toJSON().keys?.auth,
      p256dh_key: subscription.toJSON().keys?.p256dh,
      updated_at: new Date().toISOString()
    }, { onConflict: 'endpoint' });

    if (error) throw error;

    logger.info('Successfully subscribed to push notifications.');
    return true;

  } catch (err) {
    logger.error('Error subscribing to push notifications:', err as Error);
    return false;
  }
}

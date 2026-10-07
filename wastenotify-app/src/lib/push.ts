import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { registerDevice, unregisterDevice } from './api';

/**
 * Push registration.
 *
 * Native only. On the web `PushNotifications` is unimplemented and every call
 * throws, so the guard is what keeps the browser build working — this app is
 * developed in a browser far more often than on a handset.
 *
 * Nothing here is required for the app to function: in-app notifications are
 * written server-side regardless, and the notifications screen is the source of
 * truth. Push is delivery, not state.
 */

let currentToken: string | null = null;
let wired = false;

export function pushAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Ask for permission, register with FCM/APNs, and hand the token to the API.
 *
 * Safe to call repeatedly — the listeners are attached once, and the server
 * upserts on the token so re-registering the same handset is not a new row.
 */
export async function enablePush(onOpen?: (reportId: number) => void): Promise<void> {
  if (!pushAvailable()) return;

  try {
    let status = await PushNotifications.checkPermissions();

    if (status.receive === 'prompt') {
      status = await PushNotifications.requestPermissions();
    }

    // Declined is a legitimate answer, not an error to retry into.
    if (status.receive !== 'granted') return;

    if (!wired) {
      wired = true;

      PushNotifications.addListener('registration', async (token) => {
        currentToken = token.value;
        try {
          await registerDevice(token.value, Capacitor.getPlatform());
        } catch {
          // The device simply won't get pushes this session; the in-app list
          // still shows everything.
        }
      });

      PushNotifications.addListener('registrationError', () => {
        currentToken = null;
      });

      // Tapping a push should land on the thing it was about, not the home tab.
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const id = Number(action.notification.data?.report_id);
        if (id && onOpen) onOpen(id);
      });
    }

    await PushNotifications.register();
  } catch {
    /* push is optional; never block sign-in on it */
  }
}

/**
 * Drop this device's registration on sign-out, so the next person to use the
 * handset isn't sent the previous account's reports.
 */
export async function disablePush(): Promise<void> {
  if (!pushAvailable() || !currentToken) return;

  try {
    await unregisterDevice(currentToken);
  } catch {
    /* best effort — the token is also reassigned on next registration */
  } finally {
    currentToken = null;
  }
}

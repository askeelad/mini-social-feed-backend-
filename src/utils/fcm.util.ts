import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { logger } from './logger.util';

/**
 * Initialises the Firebase Admin SDK once (idempotent).
 * Called on app startup from the config layer.
 */
export const initializeFirebase = (): void => {
  if (getApps().length > 0) return;

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    logger.warn('Firebase credentials missing. FCM notifications will be disabled.');
    return;
  }

  try {
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^["']|["']$/g, ''),
        clientEmail: FIREBASE_CLIENT_EMAIL,
      }),
    });
    logger.info('Firebase Admin SDK initialised.');
  } catch (error) {
    logger.warn(
      'Failed to initialise Firebase Admin SDK. Push notifications will be disabled:',
      (error as Error).message,
    );
  }
};

export interface FcmPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Sends a push notification via Firebase Cloud Messaging.
 * Silently logs and returns false if Firebase is not initialised (e.g. missing credentials).
 */
export const sendPushNotification = async (payload: FcmPayload): Promise<boolean> => {
  if (getApps().length === 0) {
    logger.warn('FCM not initialised — skipping push notification.');
    return false;
  }

  try {
    const message: Message = {
      token: payload.token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      android: {
        priority: 'high',
        notification: { sound: 'default' },
      },
      apns: {
        payload: { aps: { sound: 'default' } },
      },
    };

    const response = await getMessaging().send(message);
    logger.debug(`FCM message sent. Message ID: ${response}`);
    return true;
  } catch (error) {
    logger.error('FCM send error:', error);
    return false;
  }
};

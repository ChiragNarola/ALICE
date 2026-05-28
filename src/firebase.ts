import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);
export const messaging: Messaging = getMessaging(app);

export const requestFCMToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    return token || null;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export { onMessage };
export type { MessagePayload } from "firebase/messaging";
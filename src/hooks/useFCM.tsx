import { useEffect } from "react";
import { messaging, requestFCMToken, onMessage } from "../firebase";
import type { MessagePayload } from "firebase/messaging";
import type { AuthUser } from "../routes/models/response/Auth";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface DeviceTokenPayload {
  token: string;
  platform: "web";
}

const saveDeviceToken = async (
  fcmToken: string,
  accessToken: string
): Promise<void> => {
  try {
    const payload: DeviceTokenPayload = {
      token: fcmToken,
      platform: "web",
    };

    const res = await fetch(`${BASE_URL}/users/device-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.IsSuccess) {
      console.log("Device token saved successfully");
    } else {
      console.warn("Failed to save device token:", data.Message);
    }
  } catch (err) {
    console.error("Error saving device token:", err);
  }
};

const useFCM = (user: AuthUser | null): void => {
  useEffect(() => {
    if (!user?.token) return;
    if (user.roles?.includes("admin")) return;

    const init = async (): Promise<void> => {
      const fcmToken = await requestFCMToken();
      if (!fcmToken) return;

      const storedToken = localStorage.getItem("fcm_token");
      if (storedToken === fcmToken) return;

      await saveDeviceToken(fcmToken, user.token!);
      localStorage.setItem("fcm_token", fcmToken);
    };

    init();

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {

      const title = payload.notification?.title ?? "New Notification";
      const body = payload.notification?.body ?? "";

      const content = (
        <div>
          <p className="font-semibold text-sm">🔔 {title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{body}</p>
        </div>
      );

      toast.info(content, {
        autoClose: 6000,
      });
    });

    return () => unsubscribe();
  }, [user?.token]);
};

export default useFCM;
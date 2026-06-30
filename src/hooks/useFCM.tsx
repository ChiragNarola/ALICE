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
    const payload: DeviceTokenPayload = { token: fcmToken, platform: "web" };
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

    if (!user?.token) {
      return;
    }

    if (user.roles?.includes("admin")) {
      return;
    }

    const init = async (): Promise<void> => {
      const fcmToken = await requestFCMToken();
      if (!fcmToken) {
        return;
      }
      const storedToken = localStorage.getItem("fcm_token");
      if (storedToken === fcmToken) {
        return;
      }
      await saveDeviceToken(fcmToken, user.token!);
      localStorage.setItem("fcm_token", fcmToken);
      console.log(fcmToken);
    };

    init();

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      const title = payload.notification?.title ?? "New Notification";
      const body = payload.notification?.body ?? "";
      const question = payload.data?.question ?? "";
      const is_editable = payload.data?.is_editable === "true" || payload.data?.is_editable === "1";

      const content = (
        <div style={{ cursor: question ? "pointer" : "default" }}>
          <p className="font-semibold text-sm">🔔 {title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{body}</p>
          {question && (
            <p className="text-xs text-alice-teal mt-1 font-medium">
              Tap to {is_editable ? "ask in chat →" : "open chat →"}
            </p>
          )}
        </div>
      );

      toast.info(content, {
        autoClose: 6000,
        onClick: () => {
          if (question) {
            const params = new URLSearchParams();
            params.set("question", question);
            params.set("auto", String(is_editable));
            window.location.href = `/chat?${params.toString()}`;
          }
        },
      });
    });


    return () => {
      unsubscribe();
    };
  }, [user?.token]);
};

export default useFCM;
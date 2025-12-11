import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes

export function useAutoLogout(user: any) {
  const navigate = useNavigate();
  const logoutTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    if (user.roles?.includes("admin")) return;

    const resetTimer = () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);

      logoutTimer.current = window.setTimeout(() => {
        // save PIN data before clearing
        const savedPin = localStorage.getItem("user_pin");
        const savedEmail = localStorage.getItem("user_email");
        const pinSet = localStorage.getItem("pin_set");

        // remove only auth/session info
        sessionStorage.removeItem("auth_user");
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("session_uuid");

        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("session_uuid");

        // restore PIN info
        if (savedEmail) localStorage.setItem("user_email", savedEmail);
        if (savedPin) localStorage.setItem("user_pin", savedPin);
        if (pinSet) localStorage.setItem("pin_set", pinSet);

        navigate("/login");
      }, LOGOUT_TIME);
    };

    const events = ["mousemove", "scroll", "keydown", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [user, navigate]);
}

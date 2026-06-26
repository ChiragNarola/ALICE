import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppRouter from "./routes/app-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ChildrenProvider } from "./contexts/ChildrenContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ChatActivityProvider } from "./contexts/ChatActivityContext";
import { useAutoLogout } from "./hooks/autoLogout";
import { useState, useEffect } from "react";
import { ChatVisibilityProvider } from "./contexts/ChatVisibilityContext";
import useFCM from "./hooks/useFCM";
import { useAuth } from "./contexts/AuthContext";
import FloatingAppBanner from "./components/ui/FloatingBanner";

function AppContent() {
  const { user } = useAuth();

  const [parsedUser, setParsedUser] = useState<any>(() => {
    const storedUser =
      sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const roles: string[] = parsedUser?.roles || [];
  const isLockableRole = roles.includes("staff");

  const excludedRoutes = [
    "/login",
    "/signup",
    "/email-verification",
    "/forgotpassword",
    "/resetpassword",
    "/admin/login",
    "/admin/dashboard",
    "/admin/user",
    "/admin/staff",
    "/admin/concerns",
    "/admin/area-of-interest",
    "/admin/documents",
    "/admin/holiday-calendar",
    "/admin/nursery",
    "/admin/faq",
    "/admin/waitlist",
    "/admin/collaboration",
    "/admin/notification"
  ];

  const [locked] = useState<boolean>(() => {
    const path = window.location.pathname;
    const isExcluded = excludedRoutes.some((route) => path.startsWith(route));
    return (
      isLockableRole &&
      localStorage.getItem("isLocked") === "true" &&
      !isExcluded
    );
  });

  useEffect(() => {
    const checkUser = () => {
      const storedUser =
        sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
      if (storedUser) {
        const newUser = JSON.parse(storedUser);
        if (JSON.stringify(newUser) !== JSON.stringify(parsedUser)) {
          setParsedUser(newUser);
        }
      } else if (parsedUser) {
        setParsedUser(null);
      }
    };

    window.addEventListener("storage", checkUser);
    const interval = setInterval(checkUser, 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkUser);
    };
  }, [parsedUser]);

  useAutoLogout(parsedUser);
  useFCM(user); // ← uses AuthContext user

  return (
    <>
    
      <ToastContainer position="top-right" autoClose={3000} />
      <FloatingAppBanner excludedRoutes={excludedRoutes} />
      <ChatVisibilityProvider>
        <ChildrenProvider>
          <ChatProvider>
            <div className={locked ? "pointer-events-none filter blur-sm" : ""}>
              <AppRouter />
            </div>
          </ChatProvider>
        </ChildrenProvider>
      </ChatVisibilityProvider>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ChatActivityProvider>   {/* ← outside AuthProvider (AuthContext depends on it) */}
        <AuthProvider>         {/* ← outside AppContent so useAuth() works */}
          <AppContent />
        </AuthProvider>
      </ChatActivityProvider>
    </Router>
  );
}
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppRouter from "./routes/app-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ChildrenProvider } from "./contexts/ChildrenContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ChatActivityProvider } from "./contexts/ChatActivityContext";
import { useAutoLock } from "./hooks/autoLock";
import { useState, useEffect } from "react";
import LockScreen from "./components/LockScreen";

function AppContent() {
  const [parsedUser, setParsedUser] = useState<any>(() => {
    const storedUser =
      sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const roles: string[] = parsedUser?.roles || [];
  const isLockableRole = roles.includes("staff");

  const [locked, setLocked] = useState<boolean>(() => {
    return isLockableRole && localStorage.getItem("isLocked") === "true";
  });

  const publicRoutes = ["/login","/signup","/email-verification","/forgotpassword","/resetpassword"];

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
        setParsedUser(null); // if logged out
      }
    };

    window.addEventListener("storage", checkUser);
    const interval = setInterval(checkUser, 1000); 
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkUser);
    };
  }, [parsedUser]);

  useAutoLock(() => {
    const path = window.location.pathname;
    if (isLockableRole && !publicRoutes.includes(path)) {
      setLocked(true);
      localStorage.setItem("isLocked", "true");
    }
  }, 60000);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <ChatActivityProvider>
        <AuthProvider>
          <ChildrenProvider>
            <ChatProvider>
              <div className={locked ? "pointer-events-none filter blur-sm" : ""}>
                <AppRouter />
              </div>
              {locked && (
                <LockScreen
                  onUnlock={() => {
                    setLocked(false);
                    localStorage.removeItem("isLocked");
                  }}
                />
              )}
            </ChatProvider>
          </ChildrenProvider>
        </AuthProvider>
      </ChatActivityProvider>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

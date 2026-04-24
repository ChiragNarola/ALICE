// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, hasPin } from "../api/api-services";
import {useChatActivity } from "./ChatActivityContext";
import type {
  AuthContextType,
  AuthUser,
  APIResponse,
  LoginResponseDTO,
  LoginPayload
} from "../routes/models/response/Auth";
// import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredItem = (key: string): string | null => {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { resetActivityTimer } = useChatActivity(); 
  // const navigate = useNavigate();
  const [showSetPinAfterLogin, setShowSetPinAfterLogin] = useState(false);

  useEffect(() => {
    const storedUser = getStoredItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        sessionStorage.removeItem("auth_user");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    data: LoginPayload,
    rememberMe = false
  ): Promise<APIResponse<LoginResponseDTO> | null> => {

    const result = await loginUser(data);

    if (result?.IsSuccess) {
      const { user: u, access_token, token_type, session_uuid } = result.Data;

      const userData: AuthUser = {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        roles: u.roles,
        isChildrenAdded: result.Data.is_children_added,
        isStaffDetailAdded: result.Data.is_staff_detail_added,
        token: access_token,
        tokenType: token_type,
        sessionUUID: session_uuid,
      };

      setUser(userData);

      sessionStorage.clear();

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth_user", JSON.stringify(userData));
      storage.setItem("auth_token", access_token);
      storage.setItem("session_uuid", session_uuid);

      localStorage.setItem("user_email", u.email);

      if (data.login_type !== "pin") {
        const pin = await hasPin(u.email);

        if (!pin) {
          localStorage.setItem("pin_set", "false");
          setShowSetPinAfterLogin(true);
        } else {
          localStorage.setItem("pin_set", "true");
        }
      }
    }

    return result;
  };




const logout = async () => {
  try {
    const sessionUUID: string | null =
      getStoredItem("session_uuid") || user?.sessionUUID || null;

    if (sessionUUID) {
      await logoutUser(sessionUUID);
    }
  } catch (error) {
    console.error("Logout API call failed", error);
  } finally {
    resetActivityTimer(); // reset chat count and timer

    // 🔥 Save PIN & email BEFORE clearing storage
    const savedPin = localStorage.getItem("user_pin");
    const savedEmail = localStorage.getItem("user_email");
    const savedPinSet = localStorage.getItem("pin_set");

    setUser(null);

    // Clear everything
    sessionStorage.clear();
    localStorage.clear();

    // 🔥 Restore only what we need
    if (savedPin && savedEmail) {
      localStorage.setItem("user_pin", savedPin);
      localStorage.setItem("user_email", savedEmail);
    }
    if (savedPinSet !== null) {
      localStorage.setItem("pin_set", savedPinSet); 
    }
  }
};



  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading,showSetPinAfterLogin, setShowSetPinAfterLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

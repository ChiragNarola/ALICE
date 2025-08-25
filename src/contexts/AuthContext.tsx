// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/api-services";
import type {
  AuthContextType,
  AuthUser,
  APIResponse,
  LoginResponseDTO,
} from "../routes/models/response/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility: try both storages
const getStoredItem = (key: string): string | null => {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        // If corrupted data, clean everything
        sessionStorage.removeItem("auth_user");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    formData: FormData,
    rememberMe = false
  ): Promise<APIResponse<LoginResponseDTO> | null> => {
    const result = await loginUser(formData);

    if (result?.IsSuccess) {
      const { user: u, access_token, token_type } = result.Data;

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
      };

      setUser(userData);

      sessionStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth_user", JSON.stringify(userData));
      storage.setItem("auth_token", access_token);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

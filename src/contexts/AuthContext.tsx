import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser } from '../api/api-services';
import type { AuthContextType, AuthUser } from '../routes/models/response/Auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
            try {
                const parsedUser: AuthUser = JSON.parse(storedUser);
                // console.log("Restored user from localStorage:", parsedUser);
                setUser(parsedUser);
            } catch (error) {
                // console.error("Failed to parse stored user:", error);
                localStorage.removeItem("auth_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (formData: FormData) => {
        const result = await loginUser(formData);

        if (result?.IsSuccess) {
            const userData: AuthUser = {
                id: result.Data.user.id,
                email: result.Data.user.email,
                firstName: result.Data.user?.first_name,
                lastName: result.Data.user?.last_name,
                roles: result.Data.user.roles,
                isChildrenAdded: result.Data.is_children_added,
                isStaffDetailAdded: result.Data.is_staff_detail_added,
            };

            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            localStorage.setItem('auth_token', result.Data.access_token);
        }

        return result;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};
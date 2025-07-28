import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser } from '../api/api-services';
import type { AuthContextType, AuthUser } from '../routes/models/response/Auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (formData: FormData) => {
        const result = await loginUser(formData);
        if (result?.user && result?.access_token) {
            const userData: AuthUser = {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.first_name,
                lastName: result.user.last_name,
                roles: result.user.roles,
                token: result.access_token,
                tokenType: result.token_type,
            };
            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            localStorage.setItem('auth_token', result.access_token);
            return userData;
        }
        return null;
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

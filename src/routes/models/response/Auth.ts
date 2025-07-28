export interface AuthUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    token: string;
    tokenType: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    login: (formData: FormData) => Promise<AuthUser | null>;
    logout: () => void;
    isLoading: boolean;
}
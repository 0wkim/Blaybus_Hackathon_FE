import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 새로고침 시 인증 상태 확인
    useEffect(() => {
        const saved = localStorage.getItem("mock-auth");
        if (saved === "true") {
        setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async () => {
        setIsLoading(true);
        await new Promise((res) => setTimeout(res, 500));
        setIsAuthenticated(true);
        localStorage.setItem("mock-auth", "true");
        setIsLoading(false);
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("mock-auth");
    };

    return (
        <AuthContext.Provider
        value={{ isAuthenticated, isLoading, login, logout }}
        >
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthProvider 안에서만 사용 가능");
    return ctx;
}

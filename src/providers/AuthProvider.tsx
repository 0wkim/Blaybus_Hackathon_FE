import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 로그인
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await api.post("/api/users/login", {
        username: email,
        password,
      });

      // 로그인 성공 = 쿠키 발급 완료
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 로그아웃
  const logout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setIsAuthenticated(false);
    }
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

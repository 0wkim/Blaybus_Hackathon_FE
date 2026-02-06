import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. 초기 상태를 결정할 때 localStorage를 즉시 확인 (새로고침 시 false 방지)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 로그인
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await api.post("/api/users/login", {
        username: email,
        password,
      });

      // 2. 로그인 성공 시 브라우저 저장소에 기록
      localStorage.setItem("isLoggedIn", "true");
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
      // 3. 로그아웃 시 기록 삭제
      localStorage.removeItem("isLoggedIn");
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
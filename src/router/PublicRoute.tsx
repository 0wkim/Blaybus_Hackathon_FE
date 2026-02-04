import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  
  if (!auth) return <div>로딩 중...</div>;
  const { isAuthenticated, isLoading } = auth;

  if (isLoading) return <div>인증 확인 중...</div>;

  // 인증되었다면 대시보드로 리다이렉트 (쿠키 인증 로직 유지)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
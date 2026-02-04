import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function PublicRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>로딩 중...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

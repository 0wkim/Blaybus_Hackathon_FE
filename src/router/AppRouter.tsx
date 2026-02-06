import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import StudyPage from "../pages/StudyPage";
import PartsPage from "../pages/PartsPage";
import ProtectedRoute from "./ProtectedRoute";
import Header from "../components/Header";

function AppRouter() {
  const location = useLocation();

  // 헤더 숨길 경로
  const hideHeaderPaths = ["/", "/login", "/signup"];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study/:modelId"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parts/:modelId"
          element={
            <ProtectedRoute>
              <PartsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default AppRouter;

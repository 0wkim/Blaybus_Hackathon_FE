import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import StudyPage from "../pages/StudyPage";
import PartsPage from "../pages/PartsPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            
            <Route
                path="/study/:modelId"
                element={<ProtectedRoute><StudyPage /></ProtectedRoute>}
            />

            <Route
                path="/parts/:modelId"
                element={<ProtectedRoute><PartsPage /></ProtectedRoute>}
            />
        </Routes>
    )
}

export default AppRouter;
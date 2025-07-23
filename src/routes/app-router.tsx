import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Signup from "../pages/signup";
import ChildBasicInformation from "../pages/ChildBasicInformation";
import Chat from '../pages/ChatPage';
import WelcomeSection from "../layout/WelcomeSection";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

export default function AppRouter() {
    return (
        <Routes>
            {/* Public Routes wrapped with layout */}
            <Route element={<PublicRoute />}>
                <Route element={<WelcomeSection />}>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>
            </Route>

            {/* Private/protected routes */}
            <Route element={<PrivateRoute />}>
                <Route path="/child-basic-info" element={<ChildBasicInformation />} />
                <Route path="/chat" element={<Chat />} />
            </Route>
        </Routes>
    );
}

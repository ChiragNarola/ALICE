import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Signup from "../pages/signup";
import ChildBasicInformation from "../pages/ChildBasicInformation";
import Chat from "../pages/ChatPage";
import WelcomeSection from "../layout/WelcomeSection";
import AdminWelcomeSection from "../layout/AdminWelcomeSection";
import AdminLayout from "../layout/AdminLayout";
import DashboardLayout from "../layout/DashboardLayout";
import AdminDashboard from "../pages/admin/dashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import DefaultRoute from "./DefaultRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import UserList from "../components/admin/users/UserList";
import EmailVerification from "../components/emailValidation";
import StaffList from "../components/admin/users/StaffList";
import ConcernList from "../components/admin/concern/ConcernList";
import AreaofinterestList from "../components/admin/area_of_interest/AreaOfInterestList";
import UploadedDocsList from "../components/admin/uploadDocument";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import HolidayList from "../components/admin/holidayList";
import Nursery from "../components/admin/nursery/NurseryList";
import StaffNurseryList from "../components/admin/users/StaffNurseryList";
import FAQ from "../components/admin/faq";
import PinLogin from "../components/PinLoginScreen";
import GuestChatPage from "../pages/GuestChatPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<DefaultRoute />} />
            <Route path="/guest-chat" element={<GuestChatPage />} />

            <Route element={<WelcomeSection />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/email-verification" element={<EmailVerification />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/resetpassword" element={<ResetPassword />} />
                <Route path="/pin-login" element={<PinLogin />} />

            </Route>

            {/* Parent & Staff routes */}
            <Route element={<RoleBasedRoute allowedRoles={["parent", "staff"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/child-basic-info" element={<ChildBasicInformation />} />
                    <Route path="/chat" element={<Chat />} />
                </Route>
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminWelcomeSection />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<AdminLogin />} />
            </Route>

            <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="user" element={<UserList />} />
                    <Route path="staff" element={<StaffList />} />
                    <Route path="staff-nursery" element={<StaffNurseryList />} />
                    <Route path="concerns" element={<ConcernList />} />
                    <Route path="area-of-interest" element={<AreaofinterestList />} />
                    <Route path="documents" element={<UploadedDocsList />} />
                    <Route path="holiday-calendar" element={<HolidayList />} />
                    <Route path="nursery" element={<Nursery />} />
                    <Route path="faq" element={ <FAQ/>}/>
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

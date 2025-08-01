import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Signup from "../pages/signup";
import ChildBasicInformation from "../pages/ChildBasicInformation";
import Chat from '../pages/ChatPage';
import WelcomeSection from "../layout/WelcomeSection";
import AdminWelcomeSection from "../layout/AdminWelcomeSection";
import AdminLayout from "../layout/AdminLayout";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PrivateAdminPanelRoute from "./PrivateAdminPanelRoute";
import PublicAdminPanelRoute from "./PublicAdminPanelRoute";
import DashboardLayout from "../layout/DashboardLayout";
import AdminDashboard from "../pages/admin/dashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminForgotPassword from "../pages/admin/AdminForgotPassword";
import AdminResetPassword from "../pages/admin/AdminResetPassword";
// import AdminChild from "../pages/admin/child";
// import AdminDeveloper from "../pages/admin/developer";
// import AdminParent from "../pages/admin/parent";
// import AdminQualification from "../pages/admin/qualification";
// import AdminStaff from "../pages/admin/staff";
// import AdminTimeTable from "../pages/admin/timeTable";
// import AdminSettings from "../pages/admin/settings";


export default function AppRouter() {
    return (
        <Routes>
            <Route element={<PublicRoute />}>
                <Route element={<WelcomeSection />}>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>
            </Route>

            <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/child-basic-info" element={<ChildBasicInformation />} />
                    <Route path="/chat" element={<Chat />} />
                </Route>
            </Route>

            <Route element={<PublicAdminPanelRoute />}>
                <Route element={<AdminWelcomeSection />}>
                    <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                    <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                </Route>
            </Route>


            <Route element={<PrivateAdminPanelRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    {/* <Route path="/admin-child" element={<AdminChild />}/>
                    <Route path="/admin-developer" element={<AdminDeveloper />}/>
                    <Route path="/admin-parent" element={<AdminParent />}/>
                    <Route path="/admin-qualification" element={<AdminQualification />}/>
                    <Route path="/admin-staff" element={<AdminStaff />}/>
                    <Route path="/admin-timeTable" element={<AdminTimeTable />}/>
                    <Route path="/admin-settings" element={<AdminSettings />}/> */}
                    {/* <Route path="/chat" element={<Chat />} /> */}
                </Route>
            </Route>
        </Routes>
    );
}

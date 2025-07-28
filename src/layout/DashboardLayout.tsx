import React from "react";
import DashboardHeader from "../components/common/DashboardHeader";
import Footer from "../components/common/Footer";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {

    const { logout } = useAuth();
    const [showMessageDropdown, setShowMessageDropdown] = React.useState(false);
    const [showUserDropdown, setShowUserDropdown] = React.useState(false);
    const messageRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const userRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const handleLogout = () => {
        toast.success("Logged out!");
        logout();
    };
    return (
        <div className="min-h-screen flex flex-col bg-[#FEFCF8]">
            <DashboardHeader
                showMessageDropdown={showMessageDropdown}
                setShowMessageDropdown={setShowMessageDropdown}
                showUserDropdown={showUserDropdown}
                setShowUserDropdown={setShowUserDropdown}
                messageRef={messageRef}
                userRef={userRef}
                handleLogout={handleLogout}
            />

            <Outlet />

            <Footer />
        </div>
    );
};

export default DashboardLayout;

import React, { useState } from "react";
import DashboardHeader from "../components/common/DashboardHeader";
import Footer from "../components/common/Footer";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";
import { ChatVisibilityProvider } from "../contexts/ChatVisibilityContext";
import SlidingSideBar from "../components/SlidingSideBar";
import ChatSidebar from "../components/ChatSidebar";

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const handleToggle = () => setIsSidebarOpen(prev => !prev);

    const chatList = [
      "Add dropdown to form",
      "Grammar check request",
      "Code adjustments needed",
      "Fix function syntax",
      "Add OrganizationReminder JSON",
      "Add dropdown to form",
      "Grammar check request",
      "Code adjustments needed",
      "Fix function syntax",
    ];
    return (
        <ChatVisibilityProvider>
            <div className="min-h-screen flex flex-col bg-[#FEFCF8]">
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-300"
                        onClick={handleToggle}
                        aria-label="Close sidebar overlay"
                    />
                )}
                <ChatSidebar chats={chatList} isOpen={isSidebarOpen} onClose={handleToggle} />
                <DashboardHeader
                    showMessageDropdown={showMessageDropdown}
                    setShowMessageDropdown={setShowMessageDropdown}
                    showUserDropdown={showUserDropdown}
                    setShowUserDropdown={setShowUserDropdown}
                    messageRef={messageRef}
                    userRef={userRef}
                    handleLogout={handleLogout}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isSidebarOpen={isSidebarOpen}
                    handleToggle={handleToggle}
                />
                <Outlet />
                <Footer />
            </div>
        </ChatVisibilityProvider>
    );
};

export default DashboardLayout;

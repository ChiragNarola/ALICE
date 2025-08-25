import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/common/DashboardHeader";
import Footer from "../components/common/Footer";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";
import { ChatVisibilityProvider } from "../contexts/ChatVisibilityContext";
import ChatSidebar from "../components/ChatSidebar";
import { updateConversationtitleById, archiveConversationById } from '../api/api-services';
import { useChat } from "../contexts/ChatContext";

const DashboardLayout: React.FC = () => {

    const { logout } = useAuth();
    const { refreshChatList } = useChat();
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

    useEffect(() => {
        refreshChatList();
    }, []);

    // Archive conversation
    const Archive = async (id: number) => {
        try {
            const response = await archiveConversationById(id);
            if (response.IsSuccess) {
                toast.success("Conversation archived successfully.");
                refreshChatList();
            }
        } catch (error) {
            console.error("Error archiving conversation:", error);
        }
    };

    // Rename chat inline
    const renameInline = async (chatId: number, editedTitle: string) => {
        try {
            if (!editedTitle.trim()) return;

            const formData = new FormData();
            formData.append("title", editedTitle);

            const response = await updateConversationtitleById(chatId, formData);
            if (response.IsSuccess) {
                toast.success("Chat renamed successfully!");
                refreshChatList();
                // setEditingChatId(null);
            }
        } catch (error) {
            console.error("Failed to rename chat:", error);
        }
    };

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
                <ChatSidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} onClose={handleToggle} archive={Archive} rename={renameInline} />
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

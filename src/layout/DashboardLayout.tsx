import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/common/DashboardHeader";
import Footer from "../components/common/Footer";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Outlet } from "react-router-dom";
import { ChatVisibilityProvider } from "../contexts/ChatVisibilityContext";
import ChatSidebar from "../components/ChatSidebar";
import { getConversationList } from '../api/api-services';
import type { ConversationDTO } from "../routes/models/request/Chat";

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

    const [chatList, setChatList] = useState<{ id: number; title: string }[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await getConversationList();

                if (response.IsSuccess && response.Data) {
                    // filter out deleted, then map to {id, title}
                    const filteredChats = response.Data
                        .filter((chat: ConversationDTO) => !chat.is_deleted)
                        .map((chat: ConversationDTO) => ({
                            id: chat.id,
                            title: chat.conversation_title,
                        }));

                    setChatList(filteredChats);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, []);
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

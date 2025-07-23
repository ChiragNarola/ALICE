import React from "react";
import DashboardHeader from "../components/DashboardHeader";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const ChatPage: React.FC = () => {
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
      <main className="flex-1 flex flex-col px-2 sm:px-0 max-w-[1100px] mx-auto w-full sm:w-[95%]">
        <ChatMessages />
        <ChatInput />
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage; 
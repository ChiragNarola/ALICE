import React, { useEffect, useState } from "react";

import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { chatAPI } from '../api/api-services';
import { useAuth } from "../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import type { ChatInputProps } from "../routes/models/request/Chat";

type Message = {
  from: "alice" | "user";
  text: string;
  actions?: any;
};

const ChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatBordUniqueId, setChatboardUniqueId] = useState("");
  const [searching, IsSearching] = useState(false);

  const handleGenerate = () => {
    const uniqueId = uuidv4();
    setChatboardUniqueId(uniqueId);
    console.log("Generated UUID:", uniqueId);
  };
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const { isChatVisible, setChatVisible } = useChatVisibility();
  setChatVisible(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      from: "alice",
      text: "Hello! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about your child's development and any questions you might have. What would you like to know today?",
      actions: true,
    },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    IsSearching(true);
    if (!message.trim()) return; // avoid sending empty messages

    try {
      const request_data: ChatInputProps = {
        "query": message,
        // "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
        "conversation_id": chatBordUniqueId,
        "user_id": user?.id
      };
      const response = await chatAPI(request_data);
      if (response) {
        setMessages((prev) => [
          ...prev,
          {
            from: "user",
            text: message,
            actions: true,
          },
          {
            from: "alice",
            text: response,
            actions: true,
          },
        ]);
        setMessage("");
      }
    } catch (error) {
      console.error("Chat send error:", error);
    } finally {
      IsSearching(false);
      setMessage("");
    }
  };

  return (
    <>
      <main className="flex-1 flex px-2 sm:px-0 gap-5 w-full m-auto relative transition-all duration-700 ease-in-out">
        {/* max-w-[1300px] sm:w-[95%] */}
        {!isSidebarOpen && <span onClick={handleToggle} className="absolute z-100 top-[5px] left-4 material-symbols-outlined text-gray-700 text-2xl cursor-pointer font-bold">
          menu_open
        </span>}
        {/* <section className="overflow-hidden">
          <SlidingSideBar onSlide={isSidebarOpen} onToggle={handleToggle} />
        </section> */}
        <section className="mx-auto right pe-5">
          {isChatVisible && <>
            <ChatMessages messages={messages} />
            <ChatInput onSend={handleSendMessage} setMessage={setMessage} message={message} searching={searching} />
          </>}
        </section>
      </main>
    </>
  );
};

export default ChatPage; 
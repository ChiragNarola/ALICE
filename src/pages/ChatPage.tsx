import React, { useEffect, useState } from "react";

import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { useAuth } from "../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import type { ChatInputProps } from "../routes/models/request/Chat";
import { useChat } from "../contexts/ChatContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

type Message = {
  id?: number;
  from: "alice" | "user";
  text: string;
  actions?: any;
  user_response?: string | null;
};

const ChatPage: React.FC = () => {
  const { messages, refreshChatList } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatBordUniqueId, setChatboardUniqueId] = useState("");
  const [searching, IsSearching] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 0,
      from: "alice",
      text: "Hello! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about your child's development and any questions you might have. What would you like to know today?",
      actions: true,
      user_response: null,
    },
  ]);
  const [searchParams] = useSearchParams();
  const handleGenerate = () => {
    const conversationUUID = searchParams.get("v");
    // console.log("conversation UUID:", conversationUUID);
    if (conversationUUID) {
      setChatboardUniqueId(conversationUUID);
    } else {
      const uniqueId = uuidv4();
      setChatboardUniqueId(uniqueId);
      // console.log("Generated UUID:", uniqueId);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [searchParams]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    setChatMessages(messages);
  }, [messages]);


  const handleToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const { isChatVisible, setChatVisible } = useChatVisibility();
  setChatVisible(true);

  // const handleSendMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   IsSearching(true);
  //   if (!message.trim()) return;

  //   try {
  //     const request_data: ChatInputProps = {
  //       "query": message,
  //       "conversation_id": chatBordUniqueId,
  //       "user_id": user?.id
  //     };

  //     const response = await chatAPI(request_data);
  //     if (response) {
  //       setChatMessages((prev) => [
  //         ...prev,
  //         {
  //           id: 0,
  //           from: "user",
  //           text: message,
  //           actions: true,
  //           user_response: null,
  //         },
  //         {
  //           id: 0,
  //           from: "alice",
  //           text: response,
  //           actions: true,
  //           user_response: null,
  //         },
  //       ]);
  //       setMessage("");
  //       refreshChatList();
  //     }
  //   } catch (error) {
  //     console.error("Chat send error:", error);
  //   } finally {
  //     IsSearching(false);
  //     setMessage("");
  //   }
  // };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    IsSearching(true);

    // Add user message immediately
    setChatMessages((prev) => [
      ...prev,
      {
        id: 0,
        from: "user",
        text: message,
        actions: true,
        user_response: null,
      },
    ]);

    // Add a placeholder bot message
    const botIndex = chatMessages.length + 1;
    setChatMessages((prev) => [
      ...prev,
      { id: 0, from: "alice", text: "...", actions: true },
    ]);

    try {
      const response = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: message,
          conversation_id: chatBordUniqueId,
          user_id: user?.id,
        }),
      });

      if (!response.body) throw new Error("No response body received.");

      // const headerMessageId = response.headers.get("x-message-id");
      // const newMessageId = headerMessageId ? Number(headerMessageId) : 0;

      // console.log("x-message-id:", newMessageId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setChatMessages((prev) => {
          const copy = [...prev];
          copy[botIndex] = {
            ...copy[botIndex],
            // id: newMessageId || 0,
            text: accumulatedText,
          };
          return copy;
        });
      }
    } catch (err: any) {
      console.error("Chat API error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMessage("");
      refreshChatList();
      IsSearching(false);
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
            <ChatMessages messages={chatMessages} chatBordUniqueId={chatBordUniqueId} />
            <ChatInput onSend={handleSendMessage} setMessage={setMessage} message={message} searching={searching} />
          </>}
        </section>
      </main>
    </>
  );
};

export default ChatPage; 
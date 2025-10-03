import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import ChatChildInfo from "../components/ChatChildInfo";
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { useAuth } from "../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "../contexts/ChatContext";
import { useSearchParams } from "react-router-dom";
import StaffInfo from "../components/StaffInfo";
import { useChatActivity } from "../contexts/ChatActivityContext";
import { trackEvent, getquestions } from "../api/api-services";
import type { QuestionDTO } from "../routes/models/request/Chat";


type Message = {
  id?: number;
  from: "alice" | "user";
  text: string;
  actions?: any;
  user_response?: string | null;
};

const ChatPage: React.FC = () => {

  const { messages, refreshChatList, hasAskedQuestion, setHasAskedQuestion } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [chatBordUniqueId, setChatboardUniqueId] = useState("");
  const [searching, IsSearching] = useState(false);
  const { startTracking, stopTracking, chatCount, timeSpent } = useChatActivity();
  const [activeTab, setActiveTab] = useState<'parent' | 'staff'>('parent');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 0,
      from: "alice",
      text: "Hello! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about your child's development and any questions you might have. What would you like to know today?",
      actions: true,
      user_response: null,
    },
  ]);

  const [recommendedQuestions, setRecommendedQuestions] = useState<any | null>(null);


  const sessionUUID =
    user?.sessionUUID ||
    sessionStorage.getItem("session_uuid") ||
    localStorage.getItem("session_uuid");

  const sendChatAnalytics = (
    pageScreen: "chat_start" | "chat_mid",
    isExit: boolean = false
  ) => {
    if (!sessionUUID) return;

    const lastMessage = chatMessages[chatMessages.length - 1];
    const secondLastMessage = chatMessages[chatMessages.length - 2];
    let interaction_data = "";

    if (chatCount > 0) {
      if (secondLastMessage?.from === "user") {
        interaction_data = chatCount > 1 ? "asked follow up question" : "asked question";
      } else if (lastMessage?.from === "alice") {
        interaction_data = "responded";
      }
    }

    const event_type = isExit
      ? "exit"
      : lastMessage?.actions
        ? "button_click"
        : "page_view";

    trackEvent({
      session_id: sessionUUID,
      page_screen: pageScreen,
      event_type,
      time_spent: timeSpent,
      interaction_data,
    })
  };

  const chatStartSent = useRef(false);
  const chatMidSent = useRef(false);
  const chatExitSent = useRef(false);
  const lastMessageCount = useRef(0);

  useEffect(() => {
    if (location.pathname === "/chat") {
      sendChatAnalytics("chat_start");
      chatStartSent.current = true;
      if (user) {
        getquestions(user.id).then((response) => {
          if (response.IsSuccess && response.Data) {
            setRecommendedQuestions(response.Data);
          }
        });
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/chat" && chatCount > lastMessageCount.current) {
      sendChatAnalytics("chat_mid");
      lastMessageCount.current = chatCount;
    }
  }, [chatCount, location.pathname]);

  useEffect(() => {
    const checkView = () => {
      const view =
        location.pathname === "/chat" && !document.hidden
          ? "in_view"
          : "out_of_view";

      if (view === "out_of_view" && chatCount > 0 && !chatMidSent.current) {
        sendChatAnalytics("chat_mid");
        chatMidSent.current = true;
      }
    };

    const timeout = setTimeout(checkView, 50);
    return () => clearTimeout(timeout);
  }, [location.pathname, chatCount]);


  useEffect(() => {
    const handleBeforeUnload = () => {
      if (chatCount > 0 && !chatExitSent.current) {
        sendChatAnalytics(chatCount > 0 ? "chat_mid" : "chat_start", true);
        chatExitSent.current = true;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [chatCount]);

  const [searchParams] = useSearchParams();
  const handleGenerate = () => {
    const conversationUUID = searchParams.get("v");
    if (conversationUUID) {
      setChatboardUniqueId(conversationUUID);
    } else {
      const uniqueId = uuidv4();
      setChatboardUniqueId(uniqueId);
    }
    if (user) {
      getquestions(user.id).then((response) => {
        if (response.IsSuccess && response.Data) {
          setRecommendedQuestions(response.Data);
        }
      });
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || location.pathname !== "/chat") {
        stopTracking();
      } else {
        startTracking();
      }
    };
    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopTracking();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, startTracking, stopTracking]);


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

  const handleSendMessage = async (e: React.FormEvent, file?: File | null) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    IsSearching(true);

    // Display file name only for UI
    const userMessageText = file ? `${message} [File: ${file.name}]` : message;

    // Optimistically add user message
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "user", text: userMessageText, actions: true, user_response: null },
    ]);

    // Add placeholder for bot response
    const botIndex = chatMessages.length + 1;
    setChatMessages((prev) => [
      ...prev,
      { id: 0, from: "alice", text: "...", actions: true },
    ]);
    setHasAskedQuestion(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("query", message);
      formData.append("user_id", String(user?.id));
      formData.append("conversation_id", chatBordUniqueId || "");

      if (file) formData.append("file", file);

      const response = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
        method: "POST",
        body: formData, // don't set content-type manually
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      // 🔹 Grab headers
      const headerConversationId = response.headers.get("x-conversation-uuid");
      const headerMessageId = response.headers.get("x-message-id");
      const newMessageId = headerMessageId ? Number(headerMessageId) : Date.now();

      if (headerConversationId) {
        // Save conversation id for next request
        setChatboardUniqueId(headerConversationId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body received.");

      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        setChatMessages((prev) => {
          const copy = [...prev];
          copy[botIndex] = {
            ...copy[botIndex],
            id: newMessageId,
            text: accumulatedText,
          };
          return copy;
        });
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => {
        const copy = [...prev];
        if (copy[botIndex]) {
          copy[botIndex] = {
            ...copy[botIndex],
            text: "Something went wrong. Please try again...",
            actions: false,
          };
        }
        return copy;
      });
    } finally {
      // setMessage("");
      refreshChatList();
      IsSearching(false);
    }
  };

  const handlerecommendedMessage = async (AImessage: string) => {
    if (!AImessage.trim()) return;

    IsSearching(true);

    const userMessageText = AImessage;

    // Add user message + bot placeholder together in one update
    let botIndex = -1;
    setChatMessages((prev) => {
      botIndex = prev.length + 1;
      return [
        ...prev,
        { id: Date.now(), from: "user", text: userMessageText, actions: true, user_response: null },
        { id: 0, from: "alice", text: "...", actions: true },
      ];
    });
    setHasAskedQuestion(true);
    setMessage(""); // clear input

    try {
      const formData = new FormData();
      formData.append("query", userMessageText);
      formData.append("user_id", String(user?.id));
      formData.append("conversation_id", chatBordUniqueId || "");

      const response = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const headerConversationId = response.headers.get("x-conversation-uuid");
      const headerMessageId = response.headers.get("x-message-id");
      const newMessageId = headerMessageId ? Number(headerMessageId) : Date.now();

      if (headerConversationId) setChatboardUniqueId(headerConversationId);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body received.");

      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        setChatMessages((prev) => {
          const copy = [...prev];
          if (copy[botIndex]) {
            copy[botIndex] = {
              ...copy[botIndex],
              id: newMessageId,
              text: accumulatedText,
            };
          }
          return copy;
        });
      }

    } catch (err) {
      console.error(err);
      setChatMessages((prev) => {
        const copy = [...prev];
        if (copy[botIndex]) {
          copy[botIndex] = {
            ...copy[botIndex],
            text: "Something went wrong. Please try again...",
            actions: false,
          };
        }
        return copy;
      });
    } finally {
      refreshChatList();
      IsSearching(false);
    }
  };


  const recommendedQuestionsList =
    recommendedQuestions?.recommended.map((item: any, index: any) => (
      <button
        key={index}
        className="recommended-question-btn"
        onClick={() => handlerecommendedMessage(item.ai_recommended)}
      >
        <div>
          <b>{item.category}</b>
        </div>
        <div>{item.ai_recommended}</div>
      </button>
    ));


  return (
    <>
      <main className="flex-1 flex px-2 gap-5 w-full m-auto relative transition-all duration-700 ease-in-out">
        {!isSidebarOpen && (
          <span
            onClick={handleToggle}
            className="absolute z-50 top-[5px] left-4 material-symbols-outlined text-gray-700 text-2xl cursor-pointer font-bold"
          >
            menu_open
          </span>
        )}

        <section className="w-[0px] md:w-[50px] lg:w-[220px] shrink-0 overflow-hidden">
        </section>

        {/* Chat Section */}
        <section className="flex-1 pr-5 h-[calc(100vh-140px)] relative">
          {isChatVisible && (
            <>
              <ChatMessages messages={chatMessages} chatBordUniqueId={chatBordUniqueId} />

              <ChatInput
                onSend={handleSendMessage}
                setMessage={setMessage}
                message={message}
                searching={searching}
                recommendedQuestionsList={!hasAskedQuestion ? recommendedQuestionsList : null}
              />
            </>
          )}
        </section>

        {/* Children Info */}
        {user?.roles && (
          <aside className="hidden lg:flex flex-col border-r bg-white shadow-sm w-[350px]">
            {user.roles.some(role => role.toLowerCase() === 'parent') && !user.roles.some(role => role.toLowerCase() === 'staff') && (
              <ChatChildInfo />
            )}
            {user.roles.some(role => role.toLowerCase() === 'staff') && !user.roles.some(role => role.toLowerCase() === 'parent') && (
              <StaffInfo />
            )}
            {user.roles.some(role => role.toLowerCase() === 'parent') && user.roles.some(role => role.toLowerCase() === 'staff') && (
              <div className="h-full flex flex-col">
                {/* Tab Header */}
                <div className="bg-white border-b border-gray-200">

                  {/* Tab Navigation */}
                  <div className="flex bg-gray-50 mx-2 mb-2 rounded-xl p-1">
                    <button
                      onClick={() => setActiveTab('parent')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'parent'
                        ? 'bg-white text-teal-600 shadow-md border border-teal-100'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-white/50'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${activeTab === 'parent' ? 'bg-teal-500' : 'bg-gray-400'
                          }`}></div>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Parent</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('staff')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'staff'
                        ? 'bg-white text-teal-600 shadow-md border border-teal-100'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-white/50'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${activeTab === 'staff' ? 'bg-teal-500' : 'bg-gray-400'
                          }`}></div>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <span>Staff</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'parent' && <ChatChildInfo />}
                  {activeTab === 'staff' && <StaffInfo />}
                </div>
              </div>
            )}
          </aside>
        )}

      </main>
    </>
  );
};

export default ChatPage; 
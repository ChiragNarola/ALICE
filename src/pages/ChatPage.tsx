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

type Sender = "alice" | "user";
type Message = {
  id?: number;
  from: Sender;
  u_question: string;
  ai_answer: string;
  actions?: any;
  user_response?: string | null;
};

const ChatPage: React.FC = () => {

  const { messages, refreshChatList, setHasAskedQuestion } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [chatBordUniqueId, setChatboardUniqueId] = useState("");
  const [searching, IsSearching] = useState(false);
  const { startTracking, stopTracking, chatCount, timeSpent } = useChatActivity();
  const [activeTab, setActiveTab] = useState<'parent' | 'staff'>('parent');
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 0,
      from: "alice",
      u_question: "",
      ai_answer: "Hello! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about your child's development and any questions you might have. What would you like to know today?",
      actions: false,
      user_response: null,
    },
  ]);

  const [recommendedQuestions, setRecommendedQuestions] = useState<any | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);

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
    });
  };

  const chatStartSent = useRef(false);
  const chatMidSent = useRef(false);
  const chatExitSent = useRef(false);
  const hasFetchedQuestions = useRef(false);

  useEffect(() => {
    if (location.pathname !== "/chat" || !user || hasFetchedQuestions.current) return;

    sendChatAnalytics("chat_start");
    chatStartSent.current = true;

    getquestions(user.id).then((response) => {
      if (response.IsSuccess && response.Data) {
        setRecommendedQuestions(response.Data);
        if (!searchParams.get("v") && messages.length <= 1) {
          setShowRecommended(true);
        }
      }
    });

    hasFetchedQuestions.current = true;
  }, [location.pathname, user]);

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

  useEffect(() => {
    const question = searchParams.get("question");
    const isEditable = searchParams.get("auto") === "true";

    if (question) {
      window.history.replaceState({}, "", "/chat");
      if (isEditable) {
        setMessage(question);
      } else {
        handlerecommendedMessage(question);
      }
      return;
    }

    const pending = sessionStorage.getItem("pending_notification");
    if (pending) {
      sessionStorage.removeItem("pending_notification");
      const { question: pQuestion, is_editable: pEditable } = JSON.parse(pending);
      
      // ← wait for chat context to be ready
      setTimeout(() => {
        if (pEditable === "true") {
          setMessage(pQuestion);
        } else {
          handlerecommendedMessage(pQuestion);
        }
      }, 500);
    }
  }, []);

  const handleGenerate = () => {
    const conversationUUID = searchParams.get("v");
    if (conversationUUID) {
      setChatboardUniqueId(conversationUUID);
    } else {
      const uniqueId = uuidv4();
      setChatboardUniqueId(uniqueId);
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

    const mappedMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      from: msg.from,
      u_question: msg.u_question,
      ai_answer: msg.ai_answer,
      user_response: msg.user_response ?? null,
      actions: msg.actions ?? true,
    }));

    setChatMessages(mappedMessages);
  }, [messages]);

  const handleToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const { isChatVisible, setChatVisible } = useChatVisibility();
  setChatVisible(true);

  const handleSendMessage = async (e: React.FormEvent, file?: File | null) => {
    e.preventDefault();
    if (!message.trim() && !file) return;
    if (creditsExhausted) return;

    IsSearching(true);

    const userMessageText = file ? `${message} [File: ${file.name}]` : message;
    const tempId = Date.now();
    let dbId = tempId;

    // Show both bubbles immediately
    setChatMessages(prev => [
      ...prev,
      { id: tempId, from: "user", u_question: userMessageText, ai_answer: "", actions: true, user_response: null },
      { id: tempId, from: "alice", u_question: "", ai_answer: "...", actions: false, user_response: null },
    ]);

    setMessage("");
    setHasAskedQuestion(true);
    setShowRecommended(false);

    try {
      const formData = new FormData();
      formData.append("query", userMessageText);
      formData.append("user_id", String(user?.id));
      formData.append("conversation_id", chatBordUniqueId || "");
      if (file) formData.append("file", file);

      const token = user?.token
        || sessionStorage.getItem("auth_token")
        || localStorage.getItem("auth_token");

      const response = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          const json = await response.json();
          if (!json.IsSuccess && json.Message) {
            setCreditsExhausted(true);
            setShowRecommended(false);
            setChatMessages(prev =>
              prev.map(m =>
                m.id === dbId && m.from === "alice"
                  ? { ...m, ai_answer: json.Message, actions: false }
                  : m
              )
            );
            return;
          }
        }
        throw new Error("API error");
      }

      const headerConvId = response.headers.get("x-conversation-uuid");
      const headerUserMessageId = response.headers.get("x-user-message-id");

      if (headerConvId) setChatboardUniqueId(headerConvId);

      if (headerUserMessageId) {
        dbId = Number(headerUserMessageId);
        setChatMessages(prev =>
          prev.map(m => m.id === tempId ? { ...m, id: dbId } : m)
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        setChatMessages(prev =>
          prev.map(m =>
            m.id === dbId && m.from === "alice"
              ? { ...m, ai_answer: accumulated }
              : m
          )
        );
      }

      setChatMessages(prev =>
        prev.map(m =>
          m.id === dbId && m.from === "alice"
            ? { ...m, actions: true }
            : m
        )
      );

    } catch (err) {
      console.error("Error while streaming:", err);
      setChatMessages(prev =>
        prev.map(m =>
          m.id === dbId && m.from === "alice"
            ? { ...m, ai_answer: "Error generating response.", actions: false }
            : m
        )
      );
    } finally {
      refreshChatList();
      IsSearching(false);
    }
  };

  const handlerecommendedMessage = async (AImessage: string) => {
    if (!AImessage.trim()) return;
    if (creditsExhausted) return;

    IsSearching(true);

    const tempId = Date.now();

    // Show both bubbles immediately
    setChatMessages(prev => [
      ...prev,
      { id: tempId, from: "user", u_question: AImessage, ai_answer: "", actions: true, user_response: null },
      { id: tempId, from: "alice", u_question: "", ai_answer: "...", actions: false, user_response: null },
    ]);

    setHasAskedQuestion(true);
    setMessage("");
    setShowRecommended(false);

    try {
      const formData = new FormData();
      formData.append("query", AImessage);
      formData.append("user_id", String(user?.id));
      formData.append("conversation_id", chatBordUniqueId || "");

      const token = user?.token
        || sessionStorage.getItem("auth_token")
        || localStorage.getItem("auth_token");

      const response = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          const json = await response.json();
          if (!json.IsSuccess && json.Message) {
            setCreditsExhausted(true);
            setShowRecommended(false);
            setChatMessages(prev =>
              prev.map(m =>
                m.id === tempId && m.from === "alice"
                  ? { ...m, ai_answer: json.Message, actions: false }
                  : m
              )
            );
            return;
          }
        }
        throw new Error("API error");
      }

      const headerConvId = response.headers.get("x-conversation-uuid");
      const headerUserMessageId = response.headers.get("x-user-message-id");
      const dbId = headerUserMessageId ? Number(headerUserMessageId) : tempId;

      if (headerConvId) setChatboardUniqueId(headerConvId);

      if (dbId !== tempId) {
        setChatMessages(prev =>
          prev.map(m => m.id === tempId ? { ...m, id: dbId } : m)
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        setChatMessages(prev =>
          prev.map(m =>
            m.id === dbId && m.from === "alice"
              ? { ...m, ai_answer: accumulated }
              : m
          )
        );
      }

      setChatMessages(prev =>
        prev.map(m =>
          m.id === dbId && m.from === "alice"
            ? { ...m, actions: true }
            : m
        )
      );

    } catch (err) {
      console.error(err);
      setChatMessages(prev =>
        prev.map(m =>
          m.id === tempId && m.from === "alice"
            ? { ...m, ai_answer: "Something went wrong.", actions: false }
            : m
        )
      );
    } finally {
      refreshChatList();
      IsSearching(false);
    }
  };

  const updateMessageReaction = (
    messageId: number,
    reaction: "like" | "dislike" | null
  ) =>
    setChatMessages(prev =>
      prev.map(m =>
        m.id === messageId && m.from === "alice"
          ? { ...m, user_response: reaction }
          : m
      )
    );

  const recommendedQuestionsList =
    recommendedQuestions?.ai_recommended?.map((question: string, index: number) => (
      <button
        key={index}
        className="
          recommended-question-btn
          px-2 py-1 
          border rounded 
          text-sm 
          text-left
          break-words 
          w-full
        "
        style={{ width: "33%" }}
        onClick={() => handlerecommendedMessage(question)}
      >
        {question}
      </button>
    )) ?? [];

  const hasUserMessages = messages.some(m => m.from === "user");
  const isNewChat = !searchParams.get("v") && !hasUserMessages;

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
              <ChatMessages
                messages={chatMessages}
                chatBordUniqueId={chatBordUniqueId}
                onReact={updateMessageReaction}
              />
              <ChatInput
                onSend={handleSendMessage}
                setMessage={setMessage}
                message={message}
                searching={searching}
                creditsExhausted={creditsExhausted}
                recommendedQuestionsList={isNewChat && showRecommended ? recommendedQuestionsList : []}
                isNewChat={isNewChat}
              />
            </>
          )}
        </section>

        {/* Children Info */}
        {user?.roles && (
          <aside className="hidden lg:flex flex-col border-r bg-white shadow-sm w-[350px] h-[calc(100vh-140px)]">
            {user.roles.some(role => role.toLowerCase() === 'parent') && !user.roles.some(role => role.toLowerCase() === 'staff') && (
              <ChatChildInfo />
            )}
            {user.roles.some(role => role.toLowerCase() === 'staff') && !user.roles.some(role => role.toLowerCase() === 'parent') && (
              <StaffInfo />
            )}
            {user.roles.some(role => role.toLowerCase() === 'parent') && user.roles.some(role => role.toLowerCase() === 'staff') && (
              <div className="h-full flex flex-col">
                <div className="bg-white border-b border-gray-200">
                  <div className="flex bg-gray-50 mx-2 mb-2 rounded-xl p-1">
                    <button
                      onClick={() => setActiveTab('parent')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'parent'
                        ? 'bg-white text-teal-600 shadow-md border border-teal-100'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-white/50'
                        }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${activeTab === 'parent' ? 'bg-teal-500' : 'bg-gray-400'}`}></div>
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
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${activeTab === 'staff' ? 'bg-teal-500' : 'bg-gray-400'}`}></div>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <span>Staff</span>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
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
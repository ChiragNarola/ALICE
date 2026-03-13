import React, { useEffect, useState } from "react";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "../contexts/ChatContext";
import { useChatActivity } from "../contexts/ChatActivityContext";

type Sender = "alice" | "user";
type Message = {
  id?: number;
  from: Sender;
  u_question: string;
  ai_answer: string;
  actions?: any;
  user_response?: string | null;
};

const GuestChatPage: React.FC = () => {
  const { messages, setHasAskedQuestion } = useChat();
  const [message, setMessage] = useState("");
  const [chatBordUniqueId, setChatboardUniqueId] = useState("");
  const [searching, IsSearching] = useState(false);
  const { startTracking, stopTracking } = useChatActivity();
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

  useEffect(() => {
    if (!chatBordUniqueId) {
      const uniqueId = uuidv4();
      setChatboardUniqueId(uniqueId);
      if (!sessionStorage.getItem("session_uuid")) {
          sessionStorage.setItem("session_uuid", uuidv4());
      }
    }
  }, [chatBordUniqueId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
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
  }, [startTracking, stopTracking]);

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

  const { setChatVisible } = useChatVisibility();
  useEffect(() => {
      setChatVisible(true);
  }, [setChatVisible]);

  const handleSendMessage = async (e: React.FormEvent, file?: File | null) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    IsSearching(true);

    const userMessageText = file ? `${message} [File: ${file.name}]` : message;
    const tempId = Date.now();
    let dbId = tempId;

    setChatMessages(prev => [
      ...prev,
      { id: tempId, from: "user", u_question: userMessageText, ai_answer: "", actions: true, user_response: null },
      { id: tempId, from: "alice", u_question: "", ai_answer: "...", actions: false }
    ]);

    setMessage("");
    setHasAskedQuestion(true);

    try {
      const formData = new FormData();
      formData.append("query", userMessageText);
      formData.append("user_id", "guest_" + (sessionStorage.getItem("session_uuid") || "temp"));
      formData.append("conversation_id", chatBordUniqueId || "");
      if (file) formData.append("file", file);

      const response = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("API error");

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
        prev.map(m => m.id === dbId && m.from === "alice" ? { ...m, actions: true } : m)
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

  return (
    <main className="flex-1 flex px-2 gap-5 w-full max-w-5xl m-auto relative transition-all duration-700 ease-in-out">
      <section className="flex-1 pr-5 h-[calc(100vh-140px)] relative mt-10">
        <ChatMessages messages={chatMessages} chatBordUniqueId={chatBordUniqueId} onReact={updateMessageReaction}/>
        <ChatInput
          onSend={handleSendMessage}
          setMessage={setMessage}
          message={message}
          searching={searching}
          recommendedQuestionsList={[]}
          isNewChat={chatMessages.length <= 1}
        />
      </section>
    </main>
  );
};

export default GuestChatPage;

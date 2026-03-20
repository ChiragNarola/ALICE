import React, { useEffect, useState } from "react";
import Modal from "../components/ui/Modal";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "../contexts/ChatContext";
import { useChatActivity } from "../contexts/ChatActivityContext";
import { guestChatRequest } from "../api/api-services";
import { useNavigate } from "react-router-dom";

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
  const { messages } = useChat();
  const [requiresSignUp, setRequiresSignUp] = useState<boolean>(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatBordUniqueId, setChatboardUniqueId] = useState("");
  const [searching, IsSearching] = useState(false);
  const { startTracking, stopTracking } = useChatActivity();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [redirectTo, setRedirectTo] = useState("");
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
    if (requiresSignUp) {
      setModalMessage("You have exceeded your trial limit. Please sign up to continue.");
      setRedirectTo("/signup");
      setShowModal(true);
      return;
    }
    IsSearching(true);

    const sessionId = localStorage.getItem("chat_session_id") || "";

    const userMessageText = file ? `${message} [File: ${file.name}]` : message;
    const tempId = Date.now();

    setChatMessages(prev => [
      ...prev,
      { id: tempId, from: "user", u_question: userMessageText, ai_answer: "", actions: true },
      { id: tempId + 1, from: "alice", u_question: "", ai_answer: "...", actions: false }
    ]);

    setMessage("");

    try {
      let responseData;

      if (file) {
        const formData = new FormData();
        formData.append("message", message);
        if (sessionId) formData.append("session_id", sessionId);
        formData.append("file", file);

        const res = await fetch(import.meta.env.VITE_API_CHAT_API_URL, {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("API error");
        responseData = await res.json();
      }
      else {
        responseData = await guestChatRequest({
          message,
          session_id: sessionId || undefined
        });
      }

      if (responseData.session_id) {
        localStorage.setItem("chat_session_id", responseData.session_id);
      }

      setChatMessages(prev =>
        prev.map(m =>
          m.id === tempId + 1
            ? { ...m, ai_answer: responseData.message, actions: true }
            : m
        )
      );

      if (responseData.requires_signup) {
        setRequiresSignUp(true);
      }

    } catch (err) {
      console.error("Error while streaming:", err);
      setChatMessages(prev =>
        prev.map(m =>
          m.id === tempId + 1
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
        <ChatMessages messages={chatMessages} chatBordUniqueId={chatBordUniqueId} onReact={updateMessageReaction} />
        <ChatInput
          onSend={handleSendMessage}
          setMessage={setMessage}
          message={message}
          searching={searching}
          recommendedQuestionsList={[]}
          isNewChat={chatMessages.length <= 1}
        />

        {showModal && (
          <Modal
            title="Notice"
            onClose={() => {
              if (redirectTo) navigate(redirectTo);
              setShowModal(false)
            }}
          >
            <p className="text-gray-600 mb-4">{modalMessage}</p>

            <button
              onClick={() => {
                if (redirectTo) navigate(redirectTo);
                setShowModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              OK
            </button>
          </Modal>
        )}
      </section>
    </main>
  );
};

export default GuestChatPage;

import { createContext, useContext, useMemo, useState } from "react";
import type { ApiMessage, ChatMessageUI } from "../routes/models/request/Chat";


type ChatContextType = {
    messages: ChatMessageUI[];
    replaceMessages: (msgs: ChatMessageUI[]) => void;
    addMessage: (msg: ChatMessageUI) => void;
    clearMessages: () => void;
    ensureAliceIntro: (text?: string) => void;

    selectedConversationId: number | null;
    setSelectedConversationId: (id: number | null) => void;

    // helper to convert API messages -> UI messages
    mapApiToUI: (api: ApiMessage[], currentUserId: number, botUserId?: number) => ChatMessageUI[];
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DEFAULT_ALICE_TEXT =
    "Hello! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about your child's development and any questions you might have. What would you like to know today?";

export const ChatProvider = ({ children }: { children: any }) => {
    const [messages, setMessages] = useState<ChatMessageUI[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

    const replaceMessages = (msgs: ChatMessageUI[]) => setMessages(msgs);
    const addMessage = (msg: ChatMessageUI) => setMessages((prev) => [...prev, msg]);
    const clearMessages = () => setMessages([]);

    const ensureAliceIntro = (text = DEFAULT_ALICE_TEXT) => {
        setMessages((prev) => {
            if (prev.length > 0 && prev[0].from === "alice") return prev;
            return [{ from: "alice", text, actions: true }, ...prev];
        });
    };

    const mapApiToUI = (api: ApiMessage[], currentUserId: number): ChatMessageUI[] => {
        return api
            .filter((m) => !m.is_deleted)
            .map((m) => ({
                id: m.id,
                from: m.user_id === currentUserId ? "user" : "alice",
                text: m.message,
                ts: m.created_at,
                actions: true,
                like: m.user_response,
            }));
    };

    const value = useMemo(
        () => ({
            messages,
            replaceMessages,
            addMessage,
            clearMessages,
            ensureAliceIntro,
            selectedConversationId,
            setSelectedConversationId,
            mapApiToUI,
        }),
        [messages, selectedConversationId]
    );

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
    return ctx;
};

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { ApiMessage, ChatMessageUI, ConversationDTO } from "../routes/models/request/Chat";
import { getConversationList } from "../api/api-services";


type ChatContextType = {
    messages: ChatMessageUI[];
    replaceMessages: (msgs: ChatMessageUI[]) => void;
    addMessage: (msg: ChatMessageUI) => void;
    clearMessages: () => void;
    ensureAliceIntro: (text?: string) => void;

    selectedConversationId: number | null;
    setSelectedConversationId: (id: number | null) => void;

    mapApiToUI: (api: ApiMessage[], currentUserId: number, botUserId?: number) => ChatMessageUI[];
    chatList: { id: number; title: string; conversation_uuid: string }[];
    setChatList: React.Dispatch<
        React.SetStateAction<{ id: number; title: string; conversation_uuid: string }[]>
    >;

    refreshChatList: () => Promise<void>;
    isLoadingChatList: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DEFAULT_ALICE_TEXT =
    "Hello! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about your child's development and any questions you might have. What would you like to know today?";

export const ChatProvider = ({ children }: { children: any }) => {
    const [messages, setMessages] = useState<ChatMessageUI[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [chatList, setChatList] = useState<
        { id: number; title: string; conversation_uuid: string }[]
    >([]);
    const [isLoadingChatList, setIsLoadingChatList] = useState(false);

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

    const refreshChatList = async () => {
        setIsLoadingChatList(true);
        try {
            const response = await getConversationList();
            if (response.IsSuccess && response.Data) {
                const filteredChats = response.Data
                    .filter((chat: ConversationDTO) => !chat.is_deleted && !chat.is_archived)
                    .map((chat: ConversationDTO) => ({
                        id: chat.id,
                        title: chat.conversation_title,
                        conversation_uuid: chat.conversation_uuid,
                    }));

                setChatList(filteredChats);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setIsLoadingChatList(false);
        }
    };

    useEffect(() => {
        refreshChatList();
    }, []);

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
            chatList,
            setChatList,
            refreshChatList,
            isLoadingChatList,
        }),
        [messages, selectedConversationId, chatList, isLoadingChatList]
    );

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
    return ctx;
};

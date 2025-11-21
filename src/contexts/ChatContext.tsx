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

    hasAskedQuestion: boolean;
    setHasAskedQuestion: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [hasAskedQuestion, setHasAskedQuestion] = useState(false);


    const ensureAliceIntro = (text = DEFAULT_ALICE_TEXT) => {
    setMessages((prev) => {
        if (prev.length > 0 && prev[0].from === "alice") return prev;

        const introMessage: ChatMessageUI = {
            id: undefined,
            from: "alice",
            u_question: "",           // No question for intro
            ai_answer: text,          // Intro text goes to ai_answer
            actions: true,
            user_response: null,
            ts: new Date().toISOString(),
        };

        return [introMessage, ...prev];
    });
};

    const mapApiToUI = (api: ApiMessage[], currentUserId: number): ChatMessageUI[] => {
        return api.flatMap((m) => {
            const messages: ChatMessageUI[] = [];

            // user message
            if (m.u_question) {
                messages.push({
                    id: m.id,          // DB id, used for API
                    key: `${m.id}-user`, // unique for React
                    from: "user",
                    u_question: m.u_question,
                    ai_answer: "",
                    ts: m.created_at,
                    actions: true,
                    user_response: m.user_response,
                });
            }

            // AI message
            if (m.ai_answer) {
                messages.push({
                    id: m.id,          // DB id, used for API
                    key: `${m.id}-ai`,  // unique for React
                    from: "alice",
                    u_question: "",
                    ai_answer: m.ai_answer,
                    ts: m.updated_at ?? m.created_at,
                    actions: true,
                    user_response: m.user_response,
                });
            }

            return messages;
        });
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
            hasAskedQuestion,
            setHasAskedQuestion,
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

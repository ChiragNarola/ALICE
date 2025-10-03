export interface ChatInputProps {
    query: string;
    conversation_id: string;
    user_id: number | undefined;
}

export interface ConversationDTO {
    id: number;
    updated_at: string;
    is_testdata: boolean;
    conversation_uuid: string;
    is_deleted: boolean;
    is_archived: boolean;
    created_at: string;
    conversation_title: string;
    conversation_id: number;
}

export type Sender = "user" | "alice";

export interface ChatMessageUI {
    id?: number;
    from: Sender;
    text: string;
    actions?: boolean;
    user_response?: string | null;
    ts?: string;
}

export interface ApiMessage {
    id: number;
    is_deleted: boolean;
    user_id: number;
    user_response: string | null;
    created_at: string;
    updated_at: string;
    is_testdata: boolean;
    message: string;
    conversation_id: number;
}

export interface QuestionDTO {
    user_id: number;
    recommended: AIrecommendedDTO[];
}

export interface AIrecommendedDTO {
    ai_recommended: string;
    category: string
}
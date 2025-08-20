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
    created_at: string;
    conversation_title: string;
}

export type Sender = "user" | "alice";

export interface ChatMessageUI {
    id?: number;
    from: Sender;
    text: string;
    actions?: boolean;
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
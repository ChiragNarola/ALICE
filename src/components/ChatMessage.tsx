import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateConversationReactionById } from "../api/api-services";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import TypingIndicator from "./ui/TypingIndicator";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
    id?: number | undefined;
    from: "alice" | "user";
    text: string;
    actions?: boolean;
    userimg: string;
    user_response?: string | null; // "like", "dislike", or null
    chatBordUniqueId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    from,
    text,
    actions,
    userimg,
    user_response,
    chatBordUniqueId
}) => {
    const isAlice = from === "alice";

    const [liked, setLiked] = useState(user_response === "like");
    const [disliked, setDisliked] = useState(user_response === "dislike");

    useEffect(() => {
        setLiked(user_response === "like");
        setDisliked(user_response === "dislike");
    }, [user_response]);

    // copy to clipboard helper
    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            toast.success("Copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleLike = async (id: number) => {
        try {
            // if (liked) {
            //     setLiked(false);
            //     await updateConversationReactionById(chatBordUniqueId, id, null);
            // } else {
            const response = await updateConversationReactionById(chatBordUniqueId, id, 0);
            if (response.IsSuccess) {
                setLiked(true);
                setDisliked(false);
            }
            // }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    const handleDislike = async (id: number) => {
        try {
            // if (disliked) {
            //     setDisliked(false);
            //     await updateConversationReactionById(chatBordUniqueId, id, null);
            // } else {
            const response = await updateConversationReactionById(chatBordUniqueId, id, 1);
            if (response.IsSuccess) {
                setDisliked(true);
                setLiked(false);
            }
            //}
        } catch (error) {
            console.error("Error updating dislike:", error);
        }
    };

    return (
        <div
            className={`flex ${isAlice ? "flex-row" : "flex-row-reverse"
                } items-end gap-[6px] sm:gap-[10px]`}
        >
            <div
                className={`flex ${isAlice ? "flex-row" : "flex-row-reverse"} items-start gap-3 sm:gap-4 w-full max-w-3xl`}
            >
                {/* Avatar */}
                {isAlice ? (
                    <div className="flex-shrink-0">
                        <div className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] lg:w-[50px] lg:h-[50px] bg-alice-teal rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl lg:text-[32px]">
                            A
                        </div>
                    </div>
                ) : (
                    <img
                        src={userimg}
                        alt="User"
                        className="flex-shrink-0 w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] lg:w-[50px] lg:h-[50px] rounded-full object-cover"
                    />
                )}

                {/* Message + Actions */}
                <div className="flex flex-col w-full">
                    {/* Message bubble */}
                    <div
                        className={`w-full rounded-lg p-3
                            ${isAlice ? "text-alice-black rounded-bl-none" : "text-alice-black rounded-br-none"}
                            ${isAlice ? "bg-[#0080800D]" : "bg-[#1B1B1B0D]"}
                            ${text === "Something went wrong. Please try again." ? "bg-red-50" : ""}
                        `}
                    >
                        <div className="whitespace-pre-line text-sm font-normal">
                            {text === "..." ? <TypingIndicator /> :
                                <ReactMarkdown
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline" />
                                        ),
                                    }}
                                >
                                    {text.replace(/\n{2,}/g, "\n")}
                                </ReactMarkdown>}
                        </div>
                    </div>

                    {/* Actions bar */}
                    {actions && (
                        <div
                            className={`flex gap-2 sm:gap-2 mt-2 text-sm ${isAlice ? "justify-start" : "justify-end"
                                }`}
                        >
                            {/* Copy */}
                            <Tippy content="Copy" placement="bottom">
                                <button
                                    onClick={() => copyToClipboard(text)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-alice-teal hover:bg-teal-50 transition"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span className="hidden sm:inline">Copy</span>
                                </button>
                            </Tippy>

                            {/* Like - Dislike */}
                            {isAlice && id !== undefined && id !== null && id !== 0 && (
                                <>
                                    <Tippy content="Like" placement="bottom">
                                        <button
                                            onClick={() => liked ? "" : handleLike(id)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${liked ? "text-green-600 bg-green-50" : "text-teal-700 hover:bg-teal-50"
                                                }`}
                                        >
                                            <ThumbsUp
                                                className="w-4 h-4"
                                                stroke="currentColor"
                                                fill={liked ? "teal" : "none"}
                                            />
                                        </button>
                                    </Tippy>

                                    <Tippy content="Dislike" placement="bottom">
                                        <button
                                            onClick={() => disliked ? "" : handleDislike(id)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${disliked ? "text-red-600 bg-red-50" : "text-teal-700 hover:bg-teal-50"
                                                }`}
                                        >
                                            <ThumbsDown
                                                className="w-4 h-4"
                                                stroke="currentColor"
                                                fill={disliked ? "red" : "none"}
                                            />
                                        </button>
                                    </Tippy>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

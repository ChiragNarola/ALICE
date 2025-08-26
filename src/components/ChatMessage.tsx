import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateConversationReactionById } from "../api/api-services";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface ChatMessageProps {
    id?: number | undefined;
    from: "alice" | "user";
    text: string;
    actions?: boolean;
    userimg: string;
    user_response?: string | null; // "like", "dislike", or null
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    from,
    text,
    actions,
    userimg,
    user_response,
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
            if (liked) {
                setLiked(false);
                await updateConversationReactionById(id, null);
            } else {
                setLiked(true);
                setDisliked(false);
                await updateConversationReactionById(id, 0);
            }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    const handleDislike = async (id: number) => {
        try {
            if (disliked) {
                setDisliked(false);
                await updateConversationReactionById(id, null);
            } else {
                setDisliked(true);
                setLiked(false);
                await updateConversationReactionById(id, 1);
            }
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
                        className={`w-full rounded-2xl p-3 sm:p-4 lg:p-6
                            ${isAlice ? "text-alice-black rounded-bl-none" : "text-alice-black rounded-br-none"}
                            ${liked ? "bg-green-50" : disliked ? "bg-red-50" : isAlice ? "bg-[#0080800D]" : "bg-[#1B1B1B0D]"}
                        `}
                    >
                        <div className="whitespace-pre-line text-sm sm:text-base lg:text-base font-normal">
                            {text}
                        </div>
                    </div>

                    {/* Actions bar */}
                    {actions && (
                        <div
                            className={`flex gap-2 sm:gap-4 mt-2 text-sm ${isAlice ? "justify-start" : "justify-end"
                                }`}
                        >
                            {/* Copy */}
                            <Tippy content="Copy" placement="bottom">
                                <button
                                    onClick={() => copyToClipboard(text)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-alice-teal hover:bg-teal-50 transition"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M13.4032 9.00543V2.30371C13.4032 1.72539 12.9343 1.25657 12.356 1.25657H5.6543C5.07598 1.25657 4.60716 1.72539 4.60716 2.30371V3.97914H3.35059V2.30371C3.35059 1.03141 4.38199 0 5.6543 0H12.356C13.6283 0 14.6597 1.03141 14.6597 2.30371V9.00543C14.6597 10.2777 13.6283 11.3091 12.356 11.3091H10.6806V10.0526H12.356C12.9343 10.0526 13.4032 9.58375 13.4032 9.00543Z"
                                            fill="#008080"
                                        />
                                        <path
                                            d="M10.0526 5.65457C10.0526 5.07625 9.58375 4.60743 9.00543 4.60743H2.30371C1.72539 4.60743 1.25657 5.07625 1.25657 5.65457V12.3563C1.25657 12.9346 1.72539 13.4034 2.30371 13.4034H9.00543C9.58375 13.4034 10.0526 12.9346 10.0526 12.3563V5.65457ZM11.3091 12.3563C11.3091 13.6286 10.2777 14.66 9.00543 14.66H2.30371C1.03141 14.66 2.69851e-08 13.6286 0 12.3563V5.65457C1.07942e-07 4.38227 1.03141 3.35086 2.30371 3.35086H9.00543C10.2777 3.35086 11.3091 4.38227 11.3091 5.65457V12.3563Z"
                                            fill="#008080"
                                        />
                                    </svg>
                                    <span className="hidden sm:inline">Copy</span>
                                </button>
                            </Tippy>
                            {/* {liked} */}
                            {/* Like - Dislike */}
                            {/* {id && id !== 0 && (
                                <>
                                    <Tippy content="Like" placement="bottom">
                                        <button
                                            onClick={() => handleLike(id)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${liked
                                                ? "text-green-600 bg-green-50"
                                                : "text-teal-700 hover:bg-teal-50"
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M2 21h4V9H2v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32
                             c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.21 8.95 7 9.45 7 10v9c0 
                             1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                                            </svg>
                                        </button>
                                    </Tippy>

                                    <Tippy content="Dislike" placement="bottom">
                                        <button
                                            onClick={() => handleDislike(id)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${disliked
                                                ? "text-red-600 bg-red-50"
                                                : "text-teal-700 hover:bg-teal-50"
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22L1.14 11.27c-.09.23-.14.47-.14.73v2c0 
                             1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 
                             22l6.59-6.59c.38-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2zm7 
                             0h-4v12h4V3z"/>
                                            </svg>
                                        </button>
                                    </Tippy>
                                </>
                            )} */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

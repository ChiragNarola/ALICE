import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateConversationReactionById } from "../api/api-services";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Copy, ThumbsDown, ThumbsUp,Download } from "lucide-react";
import TypingIndicator from "./ui/TypingIndicator";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";


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
    
const exportAsPDF = (text: string, isAlice: boolean, timestamp?: string) => {
  // Clean up text:
  // - Remove [File:...] tags
  // - Convert **bold** to <strong>
  // - Ensure proper line breaks
  const cleanText = text
    .replace(/\[File:.*?\]/gi, "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Markdown bold
    .replace(/\n{2,}/g, "\n") // Multiple blank lines → single
    .replace(/\n/g, "<br/>"); // Newlines → <br/>

  // Create a temporary container for pdf content
  const container = document.createElement("div");

  // Container Styling - ChatGPT-like export style
  container.style.width = "100%";
  container.style.padding = "24px";
  container.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
  container.style.fontSize = "14px";
  container.style.lineHeight = "1.6";
  container.style.background = "#ffffff"; // Clean white background
  container.style.color = "#1b1b1b";

  // Timestamp (smaller and subtle)
  const timeHtml = timestamp
    ? `<div style="font-size:12px;color:#666;margin-bottom:12px;">
         ${timestamp}
       </div>`
    : "";

  // Sender label (System or You)
  const sender = isAlice ? "System Response" : "User Message";

  const senderHtml = `
    <div style="
      font-weight:600;
      font-size:16px;
      margin-bottom:8px;
      color:#333;
    ">
      ${sender}
    </div>
  `;

  // Final HTML to render inside the container
  container.innerHTML = `
    ${timeHtml}
    ${senderHtml}
    <div style="white-space:normal;font-size:14px;color:#222;">
      ${cleanText}
    </div>
  `;

  // Generate the PDF
  html2pdf()
    .set({
      margin: 10,
      filename: `${sender.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .save();
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
                        <div className="whitespace-pre-line text-sm font-normal flex flex-col gap-2">
                            {text === "..." ? (
                                <TypingIndicator />
                            ) : (
                                <>
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline"
                                                />
                                            ),
                                        }}
                                    >
                                        {text.replace(/\[File:.*?\]/gi, "").replace(/\n{2,}/g, "\n")}
                                    </ReactMarkdown>

                                    {/* File display */}
                                    {text.match(/file:\s*(.+)$/i) && (
                                        <div className="mt-2 flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 shadow-sm cursor-default select-none w-max max-w-full transition-all hover:shadow-md">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4 text-gray-600 flex-shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4h10v12M7 16l-4 4h16l-4-4M7 16h10" />
                                            </svg>
                                            <span className="truncate text-gray-800 font-medium text-sm">
                                                {text.match(/file:\s*(.+)$/i)?.[1].replace(/[\]\s]+$/, '')}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions bar */}
                    {actions && (
      <div
        className={`flex gap-2 sm:gap-2 mt-2 text-sm ${
          isAlice ? "justify-start" : "justify-end"
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

        {/* Export to PDF - Only for system messages */}
        {isAlice && (
          <Tippy content="Export to PDF" placement="bottom">
            <button
              onClick={() =>
                exportAsPDF(text, isAlice, new Date().toLocaleString())
              }
              className="flex items-center gap-1 px-2 py-1 rounded-md text-alice-teal hover:bg-teal-50 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </Tippy>
        )}

        {/* Like / Dislike */}
        {isAlice && id !== undefined && id !== null && id !== 0 && (
          <>
            <Tippy content="Like" placement="bottom">
              <button
                onClick={() => (liked ? "" : handleLike(id))}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                  liked
                    ? "text-green-600 bg-green-50"
                    : "text-teal-700 hover:bg-teal-50"
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
                onClick={() => (disliked ? "" : handleDislike(id))}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                  disliked
                    ? "text-red-600 bg-red-50"
                    : "text-teal-700 hover:bg-teal-50"
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

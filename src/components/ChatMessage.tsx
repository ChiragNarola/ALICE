import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateConversationReactionById } from "../api/api-services";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Copy, ThumbsDown, ThumbsUp,Download } from "lucide-react";
import TypingIndicator from "./ui/TypingIndicator";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";

interface ChatMessageProps {
    id?: number | undefined;
    realId?: number | undefined;
    from: "alice" | "user";
    u_question: string;
    ai_answer: string;
    actions?: boolean;
    userimg: string;
    user_response?: string | null; // "like", "dislike", or null
    chatBordUniqueId: string;
    isTemp?: boolean;
    onReact?: (id: number, reaction: "like" | "dislike" | null) => void; // NEW
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    realId,
    from,
    u_question,
    ai_answer,
    actions,
    userimg,
    user_response,
    chatBordUniqueId,
    isTemp=false,
    onReact
}) => {
    // console.log("user q is:", u_question);
    // console.log("ai answer is:", ai_answer);

    // Correct text selection
    const text = from === "alice" ? ai_answer || "" : u_question || "";


    // console.log("FROM VALUE:", from);

    // console.log("rendered text:", text);
    const isAlice = from === "alice";

    const [liked, setLiked] = useState(user_response === "like");
    const [disliked, setDisliked] = useState(user_response === "dislike");
    const [backendId, setBackendId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (realId) setBackendId(realId);  // Only set when backend gives the real ID
        else if (!isTemp) setBackendId(id); // fallback if not temp
    }, [realId, id, isTemp]);


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
      if (!id) return;
      try {
        if (liked) {
          // unset
          const response = await updateConversationReactionById(chatBordUniqueId, id, null);
          if (response.IsSuccess) {
            setLiked(false);
            onReact?.(id, null);
          }
        } else {
          const response = await updateConversationReactionById(chatBordUniqueId, id, 0);
          if (response.IsSuccess) {
            setLiked(true);
            setDisliked(false);
            onReact?.(id, "like");
          }
        }
      } catch (error) {
        console.error("Error updating like:", error);
      }
    };

    const handleDislike = async (id: number) => {
      if (!id) return;
      try {
        if (disliked) {
          // unset
          const response = await updateConversationReactionById(chatBordUniqueId, id, null);
          if (response.IsSuccess) {
            setDisliked(false);
            onReact?.(id, null);
          }
        } else {
          const response = await updateConversationReactionById(chatBordUniqueId, id, 1);
          if (response.IsSuccess) {
            setDisliked(true);
            setLiked(false);
            onReact?.(id, "dislike");
          }
        }
      } catch (error) {
        console.error("Error updating dislike:", error);
      }
    };
    
const exportAsPDF = (text: string, isAlice: boolean, timestamp?: string) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const lineHeight = 7;

  // Clean text: remove file tags, keep line breaks
  let cleanText = text
    .replace(/\[File:.*?\]/gi, "")   // remove file references
    .replace(/\n{2,}/g, "\n")        // collapse multiple line breaks
    .replace(/^###\s*/gm, "") // remove "###" 

  const sender = isAlice ? "System Response" : "User Message";
  let y = margin;

  // Timestamp
  if (timestamp) {
    doc.setFontSize(10);
    doc.setTextColor("#666");
    doc.text(timestamp, margin, y);
    y += lineHeight + 2;
  }

  // Sender label
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#333");
  doc.text(sender, margin, y);
  y += lineHeight + 2;

  // Message text (split into lines to wrap inside PDF width)
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#222");

  const lines = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);

  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }

  doc.save(`${sender.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.pdf`);
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
                                        {(text || "").replace(/\[File:.*?\]/gi, "").replace(/\n{2,}/g, "\n")}
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
        {isAlice && (
          <>
            <Tippy content="Like" placement="bottom">
              <button
                onClick={() => (liked ? null : handleLike(backendId!))}
                disabled={!backendId}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                  liked
                    ? "text-green-600 bg-green-50"
                    : "text-teal-700 hover:bg-teal-50"
                }`}
              >
                <ThumbsUp className="w-4 h-4" stroke="currentColor" fill={liked ? "teal" : "none"} />
              </button>
            </Tippy>

            <Tippy content="Dislike" placement="bottom">
              <button
                onClick={() => (disliked ? null : handleDislike(backendId!))}
                disabled={!backendId}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                  disliked
                    ? "text-red-600 bg-red-50"
                    : "text-teal-700 hover:bg-teal-50"
                }`}
              >
                <ThumbsDown className="w-4 h-4" stroke="currentColor" fill={disliked ? "red" : "none"} />
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

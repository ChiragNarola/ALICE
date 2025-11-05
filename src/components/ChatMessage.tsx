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
    from: "alice" | "user";
    text: string;
    actions?: boolean;
    userimg: string;
    user_response?: string | null; // "like", "dislike", or null
    chatBordUniqueId: string | null;
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
    
// const exportAsPDF = (text: string, isAlice: boolean, timestamp?: string) => {
//   const doc = new jsPDF("p", "mm", "a4");
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 10;
//   const lineHeight = 7;

//   // Clean text: remove file tags, keep line breaks
//   const cleanText = text.replace(/\[File:.*?\]/gi, "").replace(/\n{2,}/g, "\n");

//   const sender = isAlice ? "Alice AI Response" : "User Message";
//   let y = margin;

//   // Timestamp
//   if (timestamp) {
//     doc.setFontSize(10);
//     doc.setTextColor("#666");
//     doc.text(timestamp, margin, y);
//     y += lineHeight + 2;
//   }

//   // Sender label
//   doc.setFontSize(14);
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor("#333");
//   doc.text(sender, margin, y);
//   y += lineHeight + 2;

//   // Message text (split into lines to wrap inside PDF width)
//   doc.setFontSize(12);
//   doc.setFont("helvetica", "normal");
//   doc.setTextColor("#222");

//   const lines = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);

//   for (let i = 0; i < lines.length; i++) {
//     if (y + lineHeight > pageHeight - margin) {
//       doc.addPage();
//       y = margin;
//     }
//     doc.text(lines[i], margin, y);
//     y += lineHeight;
//   }

//   doc.save(`${sender.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.pdf`);
// };



// const exportAsPDF = (text: string, isAlice: boolean, timestamp?: string) => {
//   const doc = new jsPDF("p", "mm", "a4");
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 12;
//   const contentWidth = pageWidth - margin * 2;
//   const lineHeight = 6;

//   // const sanitize = (s: string) => s
//   //   .replace(/\r\n?/g, "\n")
//   //   .replace(/\[(?:File|Image|Chart|Web|Memory|Video|Audio|System|Assistant|User)[^[\]\n]*\]/gi, "")
//   //   // .replace(/\[File:.*?\]/gi, "")
//   //   .replace(/\[[a-z]+:[^\]\n]+\]/gi, "")
//   //   .replace(/``````/g, "")
//   //   .replace(/`([^`]+)`/g, "$1")
//   //   .replace(/^[ \t]*#{1,6}[ \t]*/gm, "")
//   //   .replace(/\*\*([^*]+)\*\*/g, "$1")
//   //   .replace(/\*([^*]+)\*/g, "$1")
//   //   .replace(/_([^_]+)_/g, "$1")
//   //   .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
//   //   .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-")
//   //   .replace(/\u2026/g, "...")
//   //   .replace(/[ \t]+\n/g, "\n")
//   //   .replace(/\n{3,}/g, "\n\n")
//   //   .trim();

//   const sanitize = (s: string) => s
//     .replace(/\r\n?/g, "\n")
//     .replace(/\[(?:File|Image|Chart|Web|Memory|Video|Audio|System|Assistant|User)[^[\]\n]*\]/gi, "")
//     .replace(/\[[a-z]+:[^\]\n]+\]/gi, "")
//     .replace(/``````/g, "")
//     .replace(/`([^`]+)`/g, "$1")
//     .replace(/^[ \t]*#{1,6}[ \t]*/gm, "")
//     .replace(/\*\*([^*]+)\*\*/g, "$1")
//     .replace(/\*([^*]+)\*/g, "$1")
//     .replace(/_([^_]+)_/g, "$1")
//     .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
//     .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/\u2026/g, "...")
//     .replace(/[ \t]+\n/g, "\n")
//     .replace(/\n{3,}/g, "\n\n")
//     .trim();

//   const cleanText = sanitize(text); // [attached_file:19]

//   type Block =
//     | { kind: "title"; text: string }
//     | { kind: "label"; text: string }
//     | { kind: "para"; text: string }
//     | { kind: "bullet"; text: string };

//   const toBlocks = (s: string): Block[] => {
//     const lines = s.split("\n");
//     const blocks: Block[] = [];
//     let paraBuf: string[] = [];

//     const flushPara = () => {
//       if (paraBuf.length) {
//         const joined = paraBuf.join(" ").replace(/\s{2,}/g, " ").trim();
//         if (joined) blocks.push({ kind: "para", text: joined });
//         paraBuf = [];
//       }
//     };

//     for (let raw of lines) {
//       const line = raw.trim();
//       if (!line) { flushPara(); continue; }

//       if (/^[-*•]\s+/.test(line)) {
//         flushPara();
//         blocks.push({ kind: "bullet", text: line.replace(/^[-*•]\s+/, "") });
//         continue;
//       }
//       if (/^\d+\.\s+/.test(line)) {
//         flushPara();
//         blocks.push({ kind: "title", text: line });
//         continue;
//       }
//       if (/^[A-Z][A-Za-z ]{2,20}:\s*$/.test(line)) {
//         flushPara();
//         blocks.push({ kind: "label", text: line.replace(/\s*:\s*$/, "") });
//         continue;
//       }
//       const lv = line.match(/^([A-Z][A-Za-z ]{2,20}):\s+(.*)$/);
//       if (lv) {
//         flushPara();
//         blocks.push({ kind: "label", text: lv[1] });
//         blocks.push({ kind: "para", text: lv[2] });
//         continue;
//       }
//       paraBuf.push(line);
//     }
//     flushPara();
//     return blocks;
//   };

//   const blocks = toBlocks(cleanText); // [attached_file:19]

//   const drawWrapped = (txt: string, x: number, y: number, opts?: { bold?: boolean; size?: number; color?: string }) => {
//     const size = opts?.size ?? 12;
//     const bold = opts?.bold ?? false;
//     const color = opts?.color ?? "#222";
//     doc.setFont("helvetica", bold ? "bold" : "normal");
//     doc.setFontSize(size);
//     doc.setTextColor(color);
//     const wrapped = doc.splitTextToSize(txt, contentWidth);
//     for (const line of wrapped) {
//       if (cursorY + lineHeight > pageHeight - margin) newPage();
//       doc.text(line, x, cursorY);
//       cursorY += lineHeight;
//     }
//   };

//   const header = (txt: string) => {
//     drawWrapped(txt.replace(/^\d+\.\s*/, (m) => m), margin, cursorY, { bold: true, size: 14, color: "#333" });
//     cursorY += 2;
//   };

//   const label = (txt: string) => {
//     drawWrapped(txt, margin, cursorY, { bold: true, size: 11, color: "#666" });
//   };

//   const bullet = (txt: string) => {
//     const bulletW = 4;
//     const x = margin + bulletW;
//     if (cursorY + lineHeight > pageHeight - margin) newPage();
//     doc.setFillColor("#666");
//     doc.circle(margin + 1.5, cursorY - 2.2, 0.8, "F");
//     drawWrapped(txt, x, cursorY);
//   };

//   const newPage = () => {
//     doc.addPage();
//     cursorY = margin;
//   };

//   let cursorY = margin;

//   if (timestamp) {
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.setTextColor("#222");


//     drawWrapped(timestamp, margin, cursorY, { size: 10, color: "#666" });
//     cursorY += 2;
//   }
//   const sender = isAlice ? "Alice AI Response" : "User Message";
//   doc.setDrawColor("#e5e7eb");
//   doc.setFillColor(255, 255, 255);
//   doc.setLineWidth(0.2);

//   drawWrapped(sender, margin, cursorY, { bold: true, size: 13, color: "#333" });
//   cursorY += 2;

//   let lastKind: Block["kind"] | "" = "";
//   for (const b of blocks) {
//     if (b.kind === "title") {
//       if (lastKind && lastKind !== "label") cursorY += 1;
//       header(b.text);
//     } else if (b.kind === "label") {
//       if (lastKind && lastKind !== "label") cursorY += 1;
//       label(b.text);
//     } else if (b.kind === "bullet") {
//       bullet(b.text);
//     } else {
//       drawWrapped(b.text, margin, cursorY, { size: 12, color: "#222" });
//     }
//     lastKind = b.kind;
//   }

//   const safe = sender.replace(/\s+/g, "_").toLowerCase();
//   doc.save(`${safe}_${Date.now()}.pdf`);
// };


function exportAsPDF(text: string, isAlice: boolean, timestamp?: string) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  const lineHeight = 6;

  // -------- Sanitize streamed content (remove tags/markdown, keep content) --------
  const cleanText = text
    .replace(/\r\n?/g, "\n")
    .replace(/\[(?:File|Image|Chart|Web|Memory|Video|Audio|System|Assistant|User)[^[\]\n]*\]/gi, "")
    .replace(/\[[a-z]+:[^\]\n]+\]/gi, "")
    .replace(/``````/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[ \t]*#{1,6}[ \t]*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/\u2026/g, "...")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim(); 

  // -------- Header: timestamp + sender --------
  let y = margin;
  const sender = isAlice ? "Alice AI Response" : "User Message";

  const ensureSpace = () => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage(); y = margin;
    }
  };
  const wrap = (t: string) => doc.splitTextToSize(t, contentWidth);
  const writePara = (t: string, opt?: { size?: number; color?: string; bold?: boolean }) => {
    const size = opt?.size ?? 12;
    const color = opt?.color ?? "#222";
    const bold = opt?.bold ?? false;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = wrap(t);
    for (const ln of lines) {
      ensureSpace();
      doc.text(ln, margin, y);
      y += lineHeight;
    }
  };

  if (timestamp) {
    writePara(timestamp, { size: 10, color: "#666" });
    y += 2;
  }
  writePara(sender, { size: 13, color: "#333", bold: true });
  y += 2;

  // -------- Body with smart styling --------
  const isLabelOnly = (s: string) => /^[A-Z][A-Za-z ]{2,40}:\s*$/.test(s);
  const isLabelWithValue = (s: string) => /^([A-Z][A-Za-z ]{2,40}):\s+/.test(s);
  const isNumberedTitle = (s: string) => /^\d+\.\s+/.test(s);

  const lines = cleanText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) { y += 2; continue; } // paragraph gap

    // Numbered section title: bold this line only
    if (isNumberedTitle(line)) {
      writePara(line, { size: 13, color: "#333", bold: true });
      continue;
    }

    // Standalone label like "How to Play:"
    if (isLabelOnly(line)) {
      writePara(line.replace(/\s*:\s*$/, ":"), { size: 11, color: "#666", bold: true });
      continue;
    }

    // Label and value on the same line: bold label, normal value (fixes your issue)
    if (isLabelWithValue(line)) {
      const m = line.match(/^([A-Z][A-Za-z ]{2,40}):\s+(.*)$/)!;
      const labelPart = m[1];
      const valuePart = m[2];
      writePara(`${labelPart}:`, { size: 11, color: "#666", bold: true });
      writePara(valuePart, { size: 12, color: "#222", bold: false });
      continue;
    }

    // Normalize bullets
    if (/^[-*•]\s+/.test(line)) {
      line = line.replace(/^[-*•]\s+/, "• ");
    }

    // Default paragraph
    writePara(line, { size: 12, color: "#222" });
  }

  // -------- Save --------
  const safe = sender.replace(/\s+/g, "_").toLowerCase();
  doc.save(`${safe}_${Date.now()}.pdf`);
}




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

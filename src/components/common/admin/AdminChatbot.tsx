import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { streamAdminChatbotMessage } from "../../../api/api-services";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface AdminChatbotProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminChatbot({ isOpen, onOpenChange }: AdminChatbotProps) {
  const WELCOME_MESSAGE: ChatMessage = {
    id: "welcome",
    role: "bot",
    content:
      "Hello! I'm A.L.I.C.E., your admin assistant. I'm here to help you with operational questions — signups, chats, feedback, usage, and more. What would you like to know today?",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    const botId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: botId, role: "bot", content: "" }]);

    try {
      await streamAdminChatbotMessage(trimmed, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: m.content + chunk } : m))
        );
      });
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: m.content || "Something went wrong fetching that. Please try again." }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMessages([WELCOME_MESSAGE]);
  };

  const handleCopy = async (content: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = content;
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
      toast.error("Couldn't copy to clipboard.");
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => onOpenChange(true)}
          aria-label="Open admin assistant"
          className="fixed bottom-[4.5rem] right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#008080] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#006666]"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex h-screen w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-l border-alice-gray bg-white shadow-2xl">
          <div className="relative flex h-16 flex-shrink-0 items-center justify-between border-b border-alice-gray bg-alice-peach px-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#008080] ring-1 ring-black/5">
                <span className="text-base font-semibold text-white">A</span>
              </div>
              <div>
                <p className="text-m font-bold tracking-wide text-gray-900">Ask A.L.I.C.E</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close admin assistant"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-black/5 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/50"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex w-full">
                  {msg.role === "bot" && (
                    <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#009688] text-xs font-semibold text-white">
                      A
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "ml-auto rounded-br-sm bg-[#008080] text-white"
                        : "rounded-bl-sm bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.role === "bot" && msg.content === "" && isSending ? (
                      <div className="flex items-center gap-1 py-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                      </div>
                    ) : msg.role === "bot" ? (
                      <div className="whitespace-pre-line flex flex-col gap-2 text-sm text-gray-900">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
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
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                </div>

                {msg.role === "bot" && msg.content && msg.id !== "welcome" && (
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="ml-9 mt-2 flex items-center gap-1 px-2 py-1 rounded-md text-alice-teal hover:bg-teal-50 transition"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 border-t border-alice-gray bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-lg border border-alice-gray px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#008080]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                aria-label="Send message"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#008080] text-white transition-opacity hover:bg-[#006666] disabled:opacity-40"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
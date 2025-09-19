import React, { useState, useRef, useEffect } from "react";
import { getConversationMessageByUUId } from "../api/api-services";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { Archive, Check, Pencil, Plus, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import PageLoader from "./common/PageLoader";

interface ChatSidebarProps {
  setIsSidebarOpen?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  archive?: (id: number) => void;
  rename?: (id: number, title: string) => void;
}

const DropdownMenu = ({ onRename, onArchive }: any) => (
  <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50 animate-fade-in">
    {/* Rename */}
    <button
      onClick={onRename}
      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Pencil className="w-4 h-4 mr-2" />
      Rename
    </button>

    {/* Archive */}
    <button
      onClick={onArchive}
      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Archive className="w-4 h-4 mr-2" />
      Archive
    </button>
  </div>
);

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen = true,
  setIsSidebarOpen,
  onClose,
  archive,
  rename,
}) => {
  const {
    clearMessages,
    replaceMessages,
    ensureAliceIntro,
    setSelectedConversationId,
    mapApiToUI,
    chatList,
  } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load messages if conversation UUID exists in URL
  useEffect(() => {
    const conversationUUID = searchParams.get("v");
    if (!conversationUUID || !user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await getConversationMessageByUUId(conversationUUID);

        if (response?.IsSuccess) {
          const apiMessages: any[] = Array.isArray(response)
            ? response
            : response?.Data ?? [];
          const filteredMessages = apiMessages.filter(
            (item) => !item.is_deleted && !item.is_archived
          );

          const ui = mapApiToUI(filteredMessages, user?.id ?? 0);
          replaceMessages(ui);
          ensureAliceIntro();
          setIsSidebarOpen?.(false);
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [searchParams, user]);

  const handleRenameSave = (chatId: number) => {
    if (!editedTitle.trim()) return;
    rename?.(chatId, editedTitle);
    setEditingChatId(null);
  };

  const onNewChat = () => {
    clearMessages();
    ensureAliceIntro();
    setSelectedChatId(null);
    setSelectedConversationId(null);

    setIsSidebarOpen?.(false);
    setIsLoading(true);

    setTimeout(() => {
      navigate("/chat");
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <aside
          className={`w-64 bg-white border-r border-gray-200 p-4 h-full sm:h-screen fixed top-0 left-0 z-100
            transform transition-transform duration-300
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-700 text-base font-semibold">Chats</h2>
            <button
              className="close_sidebar text-2xl text-gray-400 hover:text-gray-700 transition-colors"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              &times;
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full mb-3 px-3 py-2 text-sm bg-teal-800 text-white hover:bg-teal-900 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-white" />
            New Chat
          </button>

          <ul className="space-y-1 h-full max-h-[calc(100vh-80px)] overflow-y-auto scroll-smooth custom-scrollbar pe-2">
            {chatList.map((chat: any, idx: number) => (
              <li key={chat.id} className="relative group">
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150
                    ${chat.id === selectedChatId
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                    }`}
                  onClick={() => {
                    if (editingChatId !== null) return;
                    setSelectedChatId(chat.id);
                    setSelectedConversationId(chat.id);
                    if (chat.conversation_uuid) {
                      navigate(`/chat?v=${chat.conversation_uuid}`);
                    }
                  }}
                >
                  {editingChatId === chat.id ? (
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={editedTitle}
                        autoFocus
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSave(chat.id);
                          }
                          if (e.key === "Escape") setEditingChatId(null);
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white pr-16 pl-2 py-1.5 text-sm 
                          shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
                        placeholder="Rename chat..."
                      />

                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                        <button
                          onClick={() => handleRenameSave(chat.id)}
                          className="p-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingChatId(null)}
                          className="p-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Tippy content={chat.title} placement="bottom">
                      <span className="truncate cursor-help">{chat.title}</span>
                    </Tippy>
                  )}

                  <span
                    className={`ml-2 text-gray-400 cursor-pointer relative transition-opacity
                      ${chat.id === selectedChatId
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === idx ? null : idx);
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                    </svg>

                    {openDropdown === idx && (
                      <div ref={dropdownRef}>
                        <DropdownMenu
                          onRename={() => {
                            setEditingChatId(chat.id);
                            setEditedTitle(chat.title);
                            setOpenDropdown(null);
                          }}
                          onArchive={() => {
                            archive?.(chat.id);
                            setOpenDropdown(null);
                          }}
                        />
                      </div>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  );
};

export default ChatSidebar;
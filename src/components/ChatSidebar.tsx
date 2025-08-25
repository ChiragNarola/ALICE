import React, { useState, useRef, useEffect } from "react";
import { getConversationMessageByUUId } from "../api/api-services";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import PageLoader from "./common/PageLoader";

interface ChatSidebarProps {
  // chats: { id: number; title: string, conversation_uuid: string }[];
  setIsSidebarOpen?: any;
  isOpen?: boolean;
  onClose?: () => void;
  archive?: (id: number) => void;
  rename?: (id: number, title: string) => void;
}

const DropdownMenu = ({ onRename, onArchive }: any) => (
  <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50 animate-fade-in">
    <button
      onClick={onRename}
      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
    >
      <span className="mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path
            d="M16.475 5.408l2.117 2.117a2 2 0 0 1 0 2.828l-8.485 8.485a2 2 0 0 1-1.414.586H6v-2.693a2 2 0 0 1 .586-1.414l8.485-8.485a2 2 0 0 1 2.828 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Rename
    </button>
    <button
      onClick={onArchive}
      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
    >
      <span className="mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      Archive
    </button>
  </div>
);

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen = true, setIsSidebarOpen, onClose, archive, rename }) => {
  const { clearMessages, replaceMessages, ensureAliceIntro, setSelectedConversationId, mapApiToUI } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatList } = useChat();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [isLoadding, setIsLoadding] = useState(false);


  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const conversationUUID = searchParams.get("v");

    if (!conversationUUID || !user) return;

    const fetchMessages = async () => {
      setIsLoadding(true);
      try {
        const response = await getConversationMessageByUUId(conversationUUID);

        if (response?.IsSuccess) {
          const apiMessages: any[] = Array.isArray(response) ? response : response?.Data ?? [];
          const filteredMessages = apiMessages.filter((item) => !item.is_deleted && !item.is_archived);

          const ui = mapApiToUI(filteredMessages, user?.id ?? 0);
          replaceMessages(ui);
          ensureAliceIntro();
          setIsSidebarOpen(false);
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setIsLoadding(false);
      }
    };

    fetchMessages();
  }, [searchParams, user]);


  // Load conversation messages
  // const load = async () => {
  //   if (!selectedConversationId && !user) return;
  //   if (selectedIndex === 0) return;
  //   try {
  //     const response = await getConversationMessageById(selectedIndex);
  //     if (response.IsSuccess) {
  //       const apiMessages: any[] = Array.isArray(response) ? response : response?.Data ?? [];
  //       const filteredMessages = apiMessages.filter((item) => !item.is_deleted && !item.is_archived);
  //       const ui = mapApiToUI(filteredMessages, user?.id ?? 0);
  //       replaceMessages(ui);
  //       ensureAliceIntro();
  //       setIsSidebarOpen(false);
  //     }
  //   } catch (e) {
  //     console.error("Failed to load messages", e);
  //   }
  // };

  // useEffect(() => {
  //   load();
  // }, [selectedIndex]);

  const handleRenameSave = (chatId: number) => {
    if (!editedTitle.trim()) return;
    rename?.(chatId, editedTitle);
    setEditingChatId(null);
  };

  const onNewChat = () => {
    clearMessages();
    ensureAliceIntro();
    setSelectedIndex(0);
    setSelectedConversationId(null);

    // Show loader
    setIsSidebarOpen(false);
    setIsLoadding(true);

    // Delay navigation so loader is visible
    setTimeout(() => {
      navigate("/chat");
      setIsLoadding(false);
    }, 500);
  };

  return (
    <>
      {isLoadding ? (
        <>
          <PageLoader />
        </>
      ) : (
        <aside
          className={`
   w-64 bg-white border-r border-gray-200 p-4 h-screen fixed top-0 left-0 z-100
   transform transition-transform duration-300
   ${isOpen ? "translate-x-0" : "-translate-x-full"}
 `}
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
            className="w-full mb-3 px-3 py-2 text-sm bg-teal-800 text-white hover:bg-teal-900 rounded-lg shadow-sm transition"
          >
            + New Chat
          </button>
          <ul className="space-y-1 h-full max-h-[calc(100vh-80px)] overflow-y-auto scroll-smooth custom-scrollbar pe-2">
            {chatList.map((chat: any, idx: any) => (
              <li key={chat.id} className="relative group">
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150
           ${idx === selectedIndex ? "bg-gray-100 text-gray-900 font-medium" : "hover:bg-gray-50 text-gray-700"}
         `}
                  onClick={() => editingChatId === null && (setSelectedIndex(chat.id), setSelectedConversationId(chat.id), chat.conversation_uuid ? navigate(`/chat?v=${chat.conversation_uuid}`) : '')}
                >
                  {editingChatId === chat.id ? (
                    <>
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={editedTitle}
                          autoFocus
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { handleRenameSave(chat.id); setEditingChatId(null); }
                            if (e.key === "Escape") setEditingChatId(null);
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white pr-16 pl-2 py-1.5 text-sm 
          shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
                          placeholder="Rename chat..."
                        />

                        {/* Action buttons inside input */}
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
                    </>
                  ) : (
                    <Tippy content={chat.title} placement="bottom">
                      <span className="truncate cursor-help">{chat.title}</span>
                    </Tippy>
                  )}

                  <span
                    className={`ml-2 text-gray-400 cursor-pointer relative transition-opacity
             ${idx === selectedIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
           `}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === idx ? null : idx);
                    }}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                    </svg>

                    {openDropdown === idx && (
                      <div ref={dropdownRef}>
                        <DropdownMenu
                          onClose={() => setOpenDropdown(null)}
                          onRename={() => {
                            setEditingChatId(chat.id);
                            setEditedTitle(chat.title);
                            setOpenDropdown(null);
                          }}
                          onArchive={() => { archive?.(chat.id); setOpenDropdown(null); }}
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

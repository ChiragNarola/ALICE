import React, { useState, useRef, useEffect } from "react";
import { getConversationMessageById } from "../api/api-services";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";

interface ChatSidebarProps {
  chats: { id: number; title: string }[];
  setIsSidebarOpen?: any,
  isOpen?: boolean;
  onClose?: () => void;
}

const DropdownMenu = ({ onClose, onShare, onRename, onArchive, onDelete }: any) => (
  <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50 animate-fade-in">
    {/* <button onClick={onShare} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
      <span className="mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 16V4M12 4L7 9M12 4l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </span>Share
    </button> */}
    <button onClick={onRename} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
      <span className="mr-2">
        {/* Edit icon */}
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.475 5.408l2.117 2.117a2 2 0 0 1 0 2.828l-8.485 8.485a2 2 0 0 1-1.414.586H6v-2.693a2 2 0 0 1 .586-1.414l8.485-8.485a2 2 0 0 1 2.828 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>Rename
    </button>
    {/* <div className="border-t my-1" /> */}
    <button onClick={onArchive} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
      <span className="mr-2">
        {/* Archive icon */}
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </span>Archive
    </button>
    {/* <button onClick={onDelete} className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50">
      <span className="mr-2 text-red-600">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>Delete
    </button> */}
  </div>
);

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, isOpen = true, setIsSidebarOpen, onClose }) => {
  const {
    replaceMessages,
    ensureAliceIntro,
    selectedConversationId,
    setSelectedConversationId,
    mapApiToUI,
  } = useChat();

  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (
  //       dropdownRef.current &&
  //       !dropdownRef.current.contains(event.target as Node)
  //     ) {
  //       setOpenDropdown(null);
  //     }
  //   }
  //   if (openDropdown !== null) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [openDropdown]);


  useEffect(() => {
    const load = async () => {
      if (!selectedConversationId && !user) return;

      if (selectedIndex === 0) return;

      try {
        const response = await getConversationMessageById(selectedIndex);
        if (response.IsSuccess) {
          const apiMessages: any[] = Array.isArray(response)
            ? response
            : (response?.Data ?? []);

          const ui = mapApiToUI(apiMessages, user?.id ?? 0);

          replaceMessages(ui);
          ensureAliceIntro();
          setIsSidebarOpen(false);
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    };

    load();
  }, [selectedIndex]);

  return (
    <aside
      className={`
        w-64 bg-white border-r border-gray-200 p-4 h-screen fixed top-0 left-0 z-100
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-700 text-base font-semibold">Chats</h2>
        <button className="close_sidebar text-2xl text-gray-400 hover:text-gray-700 transition-colors" onClick={onClose} aria-label="Close sidebar">
          &times;
        </button>
      </div>
      <ul className="space-y-1 h-full max-h-[calc(100vh-80px)] overflow-y-auto scroll-smooth custom-scrollbar pe-2">
        {chats.map((chat, idx) => (
          <li key={chat.id} className="relative group">
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150
                ${idx === selectedIndex
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "hover:bg-gray-50 text-gray-700"
                }
              `}
              onClick={() => { setSelectedIndex(chat.id), setSelectedConversationId(chat.id) }}
            >
              <span className="truncate">{chat.title}</span>
              <span
                className={`ml-2 text-gray-400 cursor-pointer relative transition-opacity
                  ${idx === selectedIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
                onClick={e => {
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
                      onShare={() => { setOpenDropdown(null); }}
                      onRename={() => { setOpenDropdown(null); }}
                      onArchive={() => { setOpenDropdown(null); }}
                      onDelete={() => { setOpenDropdown(null); }}
                    />
                  </div>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ChatSidebar; 
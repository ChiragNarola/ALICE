import React, { useState } from "react";

import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useChatVisibility } from "../contexts/ChatVisibilityContext";

const ChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const handleToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const { isChatVisible,setChatVisible } = useChatVisibility();
    setChatVisible(true);
  return (
    <>
      <main className="flex-1 flex px-2 sm:px-0 gap-5 w-full m-auto relative transition-all duration-700 ease-in-out">
        {/* max-w-[1300px] sm:w-[95%] */}
        {!isSidebarOpen && <span onClick={handleToggle} className="absolute z-100 top-[5px] left-4 material-symbols-outlined text-gray-700 text-2xl cursor-pointer font-bold">
          menu_open
        </span>}
        {/* <section className="overflow-hidden">
          <SlidingSideBar onSlide={isSidebarOpen} onToggle={handleToggle} />
        </section> */}
        <section className="mx-auto right pe-5">
          {isChatVisible && <>
            <ChatMessages />
            <ChatInput />
          </>}
        </section>
      </main>
    </>
  );
};

export default ChatPage; 
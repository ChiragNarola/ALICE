import React, { useState } from "react";

import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import SlidingSideBar from "../components/SlidingSideBar";

const ChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const handleToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  return (
    <>
      <main className="relative flex-1 flex px-2 sm:px-0 max-w-[1300px] gap-[5%] w-full sm:w-[95%]">
        {!isSidebarOpen && <span onClick={handleToggle} className="absolute z-100 top-[5px] left-4 material-symbols-outlined text-gray-700 text-2xl cursor-pointer font-bold">
          menu_open
        </span> }
        <section className="left w-[25%] max-w-[400px] overflow-hidden">
          <SlidingSideBar onSlide={isSidebarOpen} onToggle={handleToggle} />
        </section>
        <section className=" mx-auto right">
          <ChatMessages />
          <ChatInput />
        </section>
      </main>
    </>
  );
};

export default ChatPage; 
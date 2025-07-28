import React from "react";

import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";

const ChatPage: React.FC = () => {
  return (
    <>
      <main className="flex-1 flex flex-col px-2 sm:px-0 max-w-[1100px] mx-auto w-full sm:w-[95%]">
        <ChatMessages />
        <ChatInput />
      </main>
    </>
  );
};

export default ChatPage; 
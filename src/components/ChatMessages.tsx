import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import userimg from "../assets/images/user-img.png";

type Message = {
  id?: number;
  from: "alice" | "user";
  text: string;
  actions?: any;
  user_response?: string | null;
};

interface ChatMessagesProps {
  messages: Message[];
  chatBordUniqueId: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, chatBordUniqueId }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col gap-6 sm:gap-8 py-6 md:py-[30px] overflow-y-auto max-h-[calc(100vh-284px)] lg:max-h-[calc(100vh-300px)] px-2 chat_wrapper">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={idx}
          id={msg.id}
          from={msg.from}
          text={msg.text}
          actions={msg.actions}
          userimg={userimg}
          user_response={msg.user_response}
          chatBordUniqueId={chatBordUniqueId}
        />
      ))}
      {/* dummy div for scroll-to-bottom */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;

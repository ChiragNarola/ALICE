import React from "react";
import ChatMessage from "./ChatMessage";
import userimg from "../assets/images/user-img.png";

const messages = [
  {
    from: "alice",
    text: "Hello axdfxv! I'm A.L.I.C.E., your parenting guide. I'm here to help you with guidance about cszvcv's development and any questions you might have. What would you like to know today?",
    actions: true,
  },
  {
    from: "user",
    text: "Lorem ipsum dolor sit amet consectetur. Nunc condimentum tempus porttitor donec praesent turpis et habitant ullamcorper.",
    actions: true,
  },
  {
    from: "alice",
    text: "Lorem ipsum dolor sit amet consectetur. Quam at consequat congue lorem diam scelerisque.",
    actions: true,
  },
];

const ChatMessages: React.FC = () => (
  <div className="flex-1 flex flex-col gap-6 sm:gap-8 lg:gap-12 py-6 md:py-[30px] overflow-y-auto max-h-[calc(100vh-284px)] lg:max-h-[calc(100vh-300px)] px-2 chat_wrapper">
    {messages.map((msg, idx) => (
      <ChatMessage
        key={idx}
        from={msg.from as "alice" | "user"}
        text={msg.text}
        actions={msg.actions}
        userimg={userimg}
      />
    ))}
  </div>
);

export default ChatMessages; 
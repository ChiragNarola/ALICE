import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChatVisibilityContextType {
  isChatVisible: boolean;
  toggleChatVisibility: () => void;
  setChatVisible: (visible: boolean) => void;
}

const ChatVisibilityContext = createContext<ChatVisibilityContextType | undefined>(undefined);

export const ChatVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isChatVisible, setIsChatVisible] = useState(true);

  const toggleChatVisibility = () => setIsChatVisible((prev) => !prev);
  const setChatVisible = (visible: boolean) => setIsChatVisible(visible);

  return (
    <ChatVisibilityContext.Provider value={{ isChatVisible, toggleChatVisibility, setChatVisible }}>
      {children}
    </ChatVisibilityContext.Provider>
  );
};

export const useChatVisibility = () => {
  const context = useContext(ChatVisibilityContext);
  if (!context) {
    throw new Error('useChatVisibility must be used within a ChatVisibilityProvider');
  }
  return context;
}; 
// ChatActivityContext.tsx
import { createContext, useContext, useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";

interface ChatActivityContextType {
  timeSpent: number;           // Total seconds spent on /chat
  chatCount: number;           // Total number of chats done
  startTracking: () => void;   // Start counting
  stopTracking: () => void;    // Stop counting
  incrementChatCount: () => void; // Increment chat count
  resetActivityTimer: () => void;   // Reset both time and count
}

const ChatActivityContext = createContext<ChatActivityContextType | undefined>(undefined);

export const ChatActivityProvider = ({ children }: { children: ReactNode }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [chatCount, setChatCount] = useState(0);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Start counting time */
  const startTracking = useCallback(() => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1); 
    }, 1000);
  }, []);

  const stopTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const incrementChatCount = useCallback(() => {
    setChatCount((prev) => prev + 1);
  }, []);

  const resetActivityTimer = useCallback(() => {
    stopTracking();
    setTimeSpent(0);
    setChatCount(0);
  }, [stopTracking]);

  return (
    <ChatActivityContext.Provider
      value={{
        timeSpent,
        chatCount,
        startTracking,
        stopTracking,
        incrementChatCount,
        resetActivityTimer,
      }}
    >
      {children}
    </ChatActivityContext.Provider>
  );
};

export const useChatActivity = () => {
  const context = useContext(ChatActivityContext);
  if (!context) {
    throw new Error("useChatActivity must be used within ChatActivityProvider");
  }
  return context;
};

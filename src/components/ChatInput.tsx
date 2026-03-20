import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ChatInputProps {
  onSend: (e: React.FormEvent<HTMLFormElement>, file?: File | null) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  searching: boolean;
  recommendedQuestionsList: React.ReactNode[];
  isNewChat: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  message,
  setMessage,
  searching,
  recommendedQuestionsList
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message + file
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() && !file) return; // prevent empty send
    onSend(e, file);

    // Clear file and message after sending
    setFile(null);
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="w-full flex flex-col absolute bottom-0 px-2">

      {/* Recommended Questions — only when new chat and has questions */}
      {recommendedQuestionsList?.length > 0 && (
        <div className="w-full flex flex-col gap-2 px-2 mb-2">
          <div className="flex flex-nowrap gap-2 w-full">
            {recommendedQuestionsList}
          </div>
        </div>
      )}
        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="w-full bg-white rounded-xl border border-alice-gray p-2 flex flex-col gap-2"
        >
          <div className="flex flex-col gap-1">
            {/* File Preview */}
            {file && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="flex items-center justify-between bg-white border border-gray-300 rounded-2xl shadow-sm px-3 py-2 w-full max-w-xs transition-all duration-300 hover:shadow-md">
                  <div className="flex-1 truncate text-gray-900 font-medium text-sm">
                    {file.name}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-800 font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 sm:gap-6 items-center">
              {/* Input Box */}
              <div className="flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hello, How may I help you today?`}
                  className="w-full border-none outline-none bg-transparent text-alice-black placeholder:text-alice-black/50 text-sm px-2 font-normal"
                />
              </div>

              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-200 w-[38px] h-[38px] p-2 rounded-full flex items-center justify-center text-gray-600 transition hover:bg-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="*"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={searching}
                className={`bg-alice-teal w-[38px] h-[38px] p-2 rounded-full flex items-center justify-center text-white transition 
              ${searching ? "opacity-60 cursor-not-allowed" : "hover:bg-teal-700"}`}
              >
                {searching ? (
                  <svg
                    className="animate-spin w-[24px] h-[24px] sm:w-[30px] sm:h-[30px]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="white"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-[24px] h-[24px] sm:w-[30px] sm:h-[30px]"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M29.7426 0.257532C29.494 0.00886056 29.121 -0.0676041 28.7947 0.0629425L0.55251 11.3597C0.229366 11.4889 0.0129796 11.7967 0.000557715 12.1445C-0.0118055 12.4924 0.182257 12.8147 0.495381 12.9666L11.6322 18.3678L17.0334 29.5045C17.1807 29.8083 17.4884 30 17.824 30C17.8345 30 17.845 29.9998 17.8554 29.9994C18.2032 29.987 18.511 29.7706 18.6402 29.4475L29.9371 1.20546C30.0677 0.878976 29.9912 0.506145 29.7426 0.257532ZM3.05235 12.253L25.4718 3.2853L12.1107 16.6462L3.05235 12.253ZM17.747 26.9476L13.3537 17.8891L26.7148 4.52819L17.747 26.9476Z"
                      fill="white"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>

  );
};

export default ChatInput;
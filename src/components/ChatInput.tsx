import React from "react";
interface ChatInputProps {
    onSend: any;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    searching: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, message, setMessage, searching }) => {
    return (
        <form onSubmit={onSend} className="w-full bg-white rounded-2xl border border-alice-gray p-3 sm:p-4 md:p-6 flex flex-col gap-2 my-4 lg:my-6">
            <div className="flex gap-4 sm:gap-6 items-center">
                <div className="flex-1">
                    <div>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Send A Message..."
                            className="flex-1 border-none outline-none bg-transparent text-alice-black placeholder:text-alice-black/50 text-base md:text-lg px-2 font-normal"
                        />
                    </div>
                    <hr className="my-4 md:my-6 border-alice-gray" />
                    <div className="flex gap-6 text-alice-teal text-sm font-medium pl-2">
                        <button type="button" className="flex items-center gap-3 hover:underline text-sm sm:text-base font-normal">
                            <svg width="12" height="17" viewBox="0 0 12 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.25778 5.88667V10.7733C4.25778 11.673 4.98703 12.4022 5.88667 12.4022C6.7863 12.4022 7.51556 11.673 7.51556 10.7733V4.25778C7.51556 2.45856 6.05697 1 4.25778 1C2.45856 1 1 2.45856 1 4.25778V10.7733C1 13.4722 3.18783 15.66 5.88667 15.66C8.58549 15.66 10.7733 13.4722 10.7733 10.7733V5.07222" stroke="#008080" stroke-width="1.5" />
                            </svg>
                            Attach
                        </button>
                        <button type="button" className="flex items-center gap-[10px] hover:underline text-sm sm:text-base font-normal">
                            <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="1" width="6" height="10" rx="3" stroke="#008080" stroke-width="1.5" />
                                <rect x="6" y="14" width="2" height="3" fill="#008080" />
                                <rect x="4" y="16" width="6" height="1" fill="#008080" />
                                <path d="M1 9V9C1 11.7614 3.23858 14 6 14H8C10.7614 14 13 11.7614 13 9V9" stroke="#008080" stroke-width="1.5" />
                            </svg>
                            Voice Message
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={searching}
                    className={`bg-alice-teal w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center text-white transition 
    ${searching ? "opacity-60 cursor-not-allowed" : "hover:bg-teal-700"}`}
                >
                    {searching ? (
                        // Loader spinner
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
                        // Send icon
                        <svg
                            className="w-[24px] h-[24px] sm:w-[30px] sm:h-[30px]"
                            width="30"
                            height="30"
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
        </form>
    );
};

export default ChatInput; 
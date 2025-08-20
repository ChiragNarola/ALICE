import React from "react";

interface ChatMessageProps {
    from: "alice" | "user";
    text: string;
    actions?: boolean;
    userimg: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ from, text, actions, userimg }) => {
    const isAlice = from === "alice";
    return (
        <div className={`flex ${isAlice ? "flex-row" : "flex-row-reverse"} items-end gap-[6px] sm:gap-[10px]`}>
            {/* Avatar */}
            {isAlice ? (
                <div className="flex flex-col items-center">
                    <div className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] lg:w-[50px] lg:h-[50px] bg-alice-teal rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl lg:text-[32px]">A</div>
                </div>
            ) : (
                <img src={userimg} alt="User" className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] lg:w-[50px] lg:h-[50px] rounded-full object-cover" />
            )}
            {/* Message bubble */}
            <div className={`max-w-[80vw] w-full sm:max-w-[1039px] rounded-2xl p-3 sm:p-4 lg:p-6 ${isAlice ? "bg-[#0080800D] text-alice-black rounded-bl-none" : "bg-[#1B1B1B0D] text-alice-black rounded-br-none"}`}>
                <div className="whitespace-pre-line text-sm sm:text-base lg:text-lg text-alice-black font-normal mb-3">{text}</div>
                {actions && (
                    <div className="flex gap-6 mt-2 text-alice-teal text-sm font-medium justify-end">
                        <button className="flex items-center gap-2 hover:underline text-sm sm:text-base font-normal">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.4032 9.00543V2.30371C13.4032 1.72539 12.9343 1.25657 12.356 1.25657H5.6543C5.07598 1.25657 4.60716 1.72539 4.60716 2.30371V3.97914H3.35059V2.30371C3.35059 1.03141 4.38199 0 5.6543 0H12.356C13.6283 0 14.6597 1.03141 14.6597 2.30371V9.00543C14.6597 10.2777 13.6283 11.3091 12.356 11.3091H10.6806V10.0526H12.356C12.9343 10.0526 13.4032 9.58375 13.4032 9.00543Z" fill="#008080" />
                                <path d="M10.0526 5.65457C10.0526 5.07625 9.58375 4.60743 9.00543 4.60743H2.30371C1.72539 4.60743 1.25657 5.07625 1.25657 5.65457V12.3563C1.25657 12.9346 1.72539 13.4034 2.30371 13.4034H9.00543C9.58375 13.4034 10.0526 12.9346 10.0526 12.3563V5.65457ZM11.3091 12.3563C11.3091 13.6286 10.2777 14.66 9.00543 14.66H2.30371C1.03141 14.66 2.69851e-08 13.6286 0 12.3563V5.65457C1.07942e-07 4.38227 1.03141 3.35086 2.30371 3.35086H9.00543C10.2777 3.35086 11.3091 4.38227 11.3091 5.65457V12.3563Z" fill="#008080" />
                            </svg>
                            Copy
                        </button>
                        {/* <button className="flex items-center gap-2 hover:underline text-sm sm:text-base font-normal">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.667969 10.6663V10.5003C0.667969 10.1331 0.965739 9.8353 1.33301 9.8353C1.70028 9.8353 1.99805 10.1331 1.99805 10.5003V10.6663C1.99805 11.3772 1.99896 11.8707 2.03028 12.2542C2.06096 12.6298 2.11779 12.8413 2.19825 12.9993L2.26856 13.1263C2.44487 13.4137 2.69789 13.6481 3 13.8021L3.12989 13.8577C3.27366 13.9092 3.46317 13.947 3.74512 13.97C4.12864 14.0014 4.62197 14.0013 5.33301 14.0013H10.6661C11.3769 14.0013 11.8705 14.0014 12.254 13.97C12.6293 13.9394 12.8411 13.8825 12.9991 13.8021L13.126 13.7308C13.4134 13.5545 13.6479 13.3014 13.8018 12.9993L13.8575 12.8695C13.9089 12.7257 13.9467 12.536 13.9698 12.2542C14.0011 11.8707 14.001 11.3772 14.001 10.6663V10.5003C14.001 10.1332 14.2989 9.8355 14.6661 9.8353C15.0333 9.8353 15.3311 10.1331 15.3311 10.5003V10.6663C15.3311 11.3553 15.3317 11.9124 15.295 12.3626C15.2622 12.7636 15.1972 13.1247 15.0528 13.4613L14.9864 13.6038C14.7209 14.1248 14.317 14.5605 13.8213 14.8646L13.6036 14.9866C13.2268 15.1786 12.8204 15.2578 12.3623 15.2952C11.9121 15.332 11.3551 15.3314 10.6661 15.3314H5.33301C4.64392 15.3314 4.08696 15.332 3.63672 15.2952C3.23618 15.2625 2.87528 15.1982 2.53907 15.054L2.39649 14.9866C1.87537 14.7211 1.43887 14.3174 1.13477 13.8216L1.0127 13.6038C0.820729 13.2271 0.741529 12.8206 0.704109 12.3626C0.667339 11.9124 0.667969 11.3553 0.667969 10.6663ZM7.33497 10.5003V2.9388L5.13672 5.13704C4.87708 5.39668 4.45601 5.39657 4.19629 5.13704C3.9366 4.87734 3.9366 4.45631 4.19629 4.19661L7.5293 0.862629L7.63086 0.779619C7.73925 0.707419 7.86785 0.668289 7.99996 0.668289C8.17606 0.668379 8.34516 0.738189 8.46976 0.862629L11.8038 4.19661C12.0631 4.45628 12.0632 4.87744 11.8038 5.13704C11.5441 5.39674 11.122 5.39674 10.8623 5.13704L8.66506 2.93977V10.5003C8.66486 10.8673 8.36706 11.1652 7.99996 11.1654C7.63284 11.1654 7.33514 10.8674 7.33497 10.5003Z" fill="#008080" />
                            </svg>
                            Share
                        </button> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage; 
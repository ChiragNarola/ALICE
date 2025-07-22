import React from "react";
import logo from "../assets/images/logo.svg";
import userimg from "../assets/images/user-img.png";

const ChatHeader: React.FC = () => (
  <header className="w-full bg-[#FEF7ED] border-b border-[#F3F0EB] py-3 px-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img src={logo} alt="A.L.I.C.E." className="h-12 w-12" />
      <div>
        <div className="font-bold text-xl sm:text-2xl text-alice-black">A.L.I.C.E.</div>
        <div className="text-xs sm:text-sm text-alice-darkgray">AI Learning, Insights & Childcare Expert</div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative">
        <button className="w-10 h-10 rounded-full bg-[#F3F0EB] flex items-center justify-center">
          {/* Message Icon */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M4 4h16v14H5.17L4 19.17V4z" stroke="#222" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <span className="absolute -top-1 -right-1 bg-[#E94F4F] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">2</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <img src={userimg} alt="User Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
        <span className="text-alice-black font-semibold">John Doe</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>
  </header>
);

export default ChatHeader; 
import React, { useEffect } from "react";
import logo from "../assets/images/logo.svg";
import userimg from "../assets/images/user-img.png";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  showMessageDropdown: boolean;
  setShowMessageDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showUserDropdown: boolean;
  setShowUserDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  messageRef: React.RefObject<HTMLDivElement | null>;
  userRef: React.RefObject<HTMLDivElement | null>;
  handleLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  // showMessageDropdown,
  // setShowMessageDropdown,
  showUserDropdown,
  setShowUserDropdown,
  messageRef,
  userRef,
  handleLogout,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showUserDropdown &&
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, setShowUserDropdown, userRef]);

  return (
    <header className="bg-alice-peach px-4 sm:px-6 md:px-[30px] py-3 sm:py-4 md:py-5 flex items-center justify-between border-b border-alice-gray">
      <div className="flex items-center gap-12">
        <img src={logo} alt="Logo" className="h-15" />
        <span className="text-xl lg:text-2xl font-bold text-alice-black hidden md:inline-block">Welcome, John Doe</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Message Button with Badge */}
        <div className="relative" ref={messageRef}>
          <button
            onClick={() => navigate("/chat")}
            className="w-[50px] h-[50px] rounded-full bg-[#D9D9D9] flex items-center justify-center focus:outline-none"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.2422 1.25195C19.5969 1.37758 24.7499 6.56044 24.75 12.7715C24.7501 19.129 19.6849 24.1969 13.1797 24.292H13.1787C11.3384 24.321 9.57477 23.9417 7.93164 23.1699H7.93262C7.22389 22.8368 6.37765 22.9703 5.80859 23.5107C4.82593 24.4439 3.46331 24.8663 2.1416 24.7197C3.03754 22.3747 3.07955 19.7871 2.21875 17.373C2.2047 17.3335 2.18994 17.2959 2.1748 17.2607L1.95703 16.7197C1.4841 15.4501 1.24662 14.1158 1.25 12.7432C1.26586 6.33675 6.69 1.12413 13.2422 1.25195Z" stroke="#1B1B1B" strokeWidth="1.5" />
              <path d="M8.8335 10.9167H14.3891" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8.8335 16.4722H18.5557" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="absolute top-2 right-2 bg-[#E94F4F] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ">2</span>
          </button>
          {/* Message Dropdown */}
          {/* {showMessageDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-4 z-10 animate-dropdown">
              <div className="text-sm text-gray-700">No new messages</div>
            </div>
          )} */}
        </div>

        {/* User Avatar and Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown((prev) => !prev)}
            className="flex items-center gap-[6px] sm:gap-[10px] focus:outline-none"
          >
            <img src={userimg} alt="User Avatar" className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] rounded-full object-cover" />
            <span className="hidden sm:inline-block text-[14px] sm:text-base font-semibold text-alice-black">John Doe</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 1L5.00002 5L1 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* User Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg py-1 px-2 z-10 animate-dropdown">
              <button
                onClick={() => navigate("/child-basic-info")}
                className="block w-full text-left text-base text-gray-700 hover:text-alice-teal rounded-xl my-1 py-2 px-3 transition-colors duration-300 hover:bg-alice-teal/10"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                //onClick={() => navigate("/login")}
                className="block w-full text-left text-base text-gray-700 hover:text-alice-teal rounded-xl my-1 py-2 px-3 transition-colors duration-300 hover:bg-alice-teal/10">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
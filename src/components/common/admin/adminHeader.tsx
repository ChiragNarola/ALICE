// import logo from "../../../assets/images/favicon.ico"
import Avatar from "react-avatar";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

export function Header() {
  const [userName, setUserName] = useState<string>();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const user = localStorage.getItem("auth_user");

    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
    }
  }, []);

  const handleLogout = () => {
    toast.success("Logged out!");
    logout();

    window.location.href = "/admin/login";
  };

  return (
    <header className="h-16 border-b border-alice-gray bg-alice-peach">
      <div className="flex items-center justify-between h-full px-4">
        <div className="ml-auto flex items-center space-x-4">
          {/* Notification button with badge */}
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-[#d6f5f5]">
            <span className="absolute top-2 flex h-[25px] w-[25px] items-center justify-center rounded-full text-black text-[30px] font-medium">
              <Bell />
            </span>
          </button>

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <div
              className="flex items-center space-x-2 p-1 h-8 rounded-full hover:bg-[#d6f5f5] cursor-pointer"
              onClick={() => setOpen((prev) => !prev)}
            >
              <div className="h-8 w-8 rounded-full bg-[#008080] text-white flex items-center justify-center text-sm font-medium">
                <Avatar name={userName} size="33" round={true} />
              </div>
            </div>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useEffect, useState } from "react";
import logo from "../../assets/images/logo.svg";
import userimg from "../../assets/images/user-img.png";
import { useNavigate} from "react-router-dom";
import { useChatVisibility } from "../../contexts/ChatVisibilityContext";
import { useChat } from "../../contexts/ChatContext";
import { User, MessageCircle, LogOut, Lock, Eye, EyeOff } from "lucide-react";
import { changePassword, setPin } from "../../api/api-services";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";


interface DashboardHeaderProps {
  showMessageDropdown: boolean;
  setShowMessageDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showUserDropdown: boolean;
  setShowUserDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  messageRef: React.RefObject<HTMLDivElement | null>;
  userRef: React.RefObject<HTMLDivElement | null>;
  handleLogout: () => void;
  setIsSidebarOpen: any;
  isSidebarOpen: any;
  handleToggle: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showUserDropdown,
  setShowUserDropdown,
  userRef,
  handleLogout,
  handleToggle,
  setIsSidebarOpen,
}) => {
  const navigate = useNavigate();
  const { clearMessages, ensureAliceIntro, setSelectedConversationId } = useChat();
  const { isChatVisible } = useChatVisibility();

  const [userName, setUserName] = useState<string>();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form data and validation
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //set pin
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showSetPin,setShowSetPin]=useState(false);
  const [pinData, setPinData] = useState({
    pin: "",
    confirm_pin: "",
  });
  const { user } = useAuth(); 



  useEffect(() => {
    const storedUser = sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
        setUserRoles(parsedUser.roles || [] );
      } catch {
        setUserName("");
        setUserRoles([]);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showUserDropdown && userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown, setShowUserDropdown, userRef]);

  const onNewChat = () => {
    clearMessages();
    ensureAliceIntro();
    setSelectedConversationId(null);
    navigate("/chat");
    setIsSidebarOpen(false);
  };

  // Validation logic
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const { current_password, new_password, confirm_password } = formData;

    if (!current_password.trim()) newErrors.current_password = "Current password is required.";

    if (!new_password.trim()) {
      newErrors.new_password = "New password is required.";
    } else if (new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(new_password)) {
      newErrors.new_password =
        "Password must include uppercase, lowercase, and special character.";
    } else if (new_password === current_password) {
      newErrors.new_password = "New password must be different from current password.";
    }

    if (!confirm_password.trim()) newErrors.confirm_password = "Please confirm your password.";
    else if (confirm_password !== new_password) newErrors.confirm_password = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await changePassword(formData.current_password, formData.new_password);

      if (response.IsSuccess) {
        toast.success("Password changed successfully!");
        setShowChangePassword(false);
        setFormData({ current_password: "", new_password: "", confirm_password: "" });
        setShowConfirm(false);
        setShowNew(false);
        setShowCurrent(false);
        setErrors({});
      } else {
        toast.error(response.Message || "Failed to change password.");
      }
    } catch (error: any) {
      toast.error(error?.Message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateSetPin = () => {
    const newErrors: { [key: string]: string } = {};
    const { pin, confirm_pin } = pinData;

    // if (!pin.trim()) newErrors.current_password = "Pin is required.";
    if (!pin.trim()) {
      newErrors.pin = "Pin is required.";
    } else if (!/^\d{4}$/.test(pin)) {
      newErrors.pin = "Pin must be exactly 4 digits";
    }
    if (!confirm_pin.trim()) newErrors.confirm_pin = "Please confirm your pin.";
    else if (confirm_pin !== pin) newErrors.confirm_pin = "Pins do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSetPin()) return;
    setLoading(true);

    try {
      const response = await setPin(pinData.pin);

      if (response.IsSuccess) {
        localStorage.setItem("user_pin",pinData.pin)
        console.log("email is:",user?.email)
        if (user?.email) {
            localStorage.setItem("user_email", user.email);
        }
        // store pin_set as true
        localStorage.setItem("pin_set", "true");
        toast.success("Pin set successfully!");
        setShowSetPin(false);
        setPinData({ pin: "", confirm_pin: ""});
        setShowConfirm(false);
        setShowNew(false);
        setShowCurrent(false);
        setErrors({});
      } else {
        toast.error(response.Message || "Failed to set pin.");
      }
    } catch (error: any) {
      toast.error(error?.Message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { showSetPinAfterLogin, setShowSetPinAfterLogin, user: authUser } = useAuth();

    useEffect(() => {
      if (showSetPinAfterLogin) {
        const roles = authUser?.roles || [];
        const pinSet = localStorage.getItem("pin_set");
        console.log("User roles on login:", roles);

        // Do NOT open modal if PIN is already set
        if (pinSet === "true") {
          setShowSetPinAfterLogin(false);
          return;
        }

        if (roles.includes("staff") || roles.includes("parent+staff")) {
          setShowSetPin(true); // show the Set PIN modal
        }

        setShowSetPinAfterLogin(false); // reset the flag

        const savedPinSet = localStorage.getItem("pin_set");
        const savedPinEmail = localStorage.getItem("user_email");
        console.log("saved pin and email is:", savedPinSet, savedPinEmail);
      }
    }, [showSetPinAfterLogin, setShowSetPinAfterLogin, authUser]);




  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-alice-peach px-4 sm:px-6 md:px-[30px] py-3 sm:py-4 md:py-5 flex items-center justify-between border-b border-alice-gray">
        <div className="flex items-center gap-3 sm:gap-6">
          {isChatVisible && (
            <button
              className="sidebar_btn w-8 h-8 flex items-center justify-center rounded-lg bg-black/10 hover:!bg-black/15 transition-colors"
              onClick={handleToggle}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.6663 12.6686L11.801 12.6823C12.1038 12.7445 12.3313 13.0125 12.3313 13.3337C12.3311 13.6547 12.1038 13.9229 11.801 13.985L11.6663 13.9987H3.33325C2.96609 13.9987 2.66839 13.7008 2.66821 13.3337C2.66821 12.9664 2.96598 12.6686 3.33325 12.6686H11.6663ZM16.6663 6.00163L16.801 6.0153C17.1038 6.07747 17.3313 6.34546 17.3313 6.66667C17.3313 6.98788 17.1038 7.25586 16.801 7.31803L16.6663 7.33171H3.33325C2.96598 7.33171 2.66821 7.03394 2.66821 6.66667C2.66821 6.2994 2.96598 6.00163 3.33325 6.00163H16.6663Z" />
              </svg>
            </button>
          )}
          <img
            onClick={onNewChat}
            src={logo}
            alt="Logo"
            className="h-12 w-auto cursor-pointer hover:opacity-80 transition"
          />
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown((prev) => !prev)}
            className="flex items-center gap-2 sm:gap-3 focus:outline-none"
          >
            <img
              src={userimg}
              alt="User Avatar"
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
            />
            <span className="hidden sm:inline-block text-sm sm:text-base font-semibold text-alice-black">
              {userName}
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path
                d="M9 1L5.00002 5L1 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 px-2 z-10 animate-dropdown">
              <button
                onClick={() => {navigate("/child-basic-info"); 
                  setShowUserDropdown(false);}}
                className="flex items-center gap-2 w-full text-left text-base rounded-xl my-1 py-2 px-3 hover:bg-alice-teal/10 text-gray-700 hover:text-alice-teal"
              >
                <User className="w-5 h-5" />
                Profile
              </button>

              <button
                onClick={() => {onNewChat();
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 w-full text-left text-base rounded-xl my-1 py-2 px-3 hover:bg-alice-teal/10 text-gray-700 hover:text-alice-teal"
              >
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>

              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setFormData({ current_password: "", new_password: "", confirm_password: "" });
                  setShowConfirm(false);
                  setShowNew(false);
                  setShowCurrent(false);
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 w-full text-left text-base rounded-xl my-1 py-2 px-3 hover:bg-alice-teal/10 text-gray-700 hover:text-alice-teal"
              >
                <Lock className="w-5 h-5" />
                Change Password
              </button>

              {userRoles.includes("staff") && localStorage.getItem("pin_set") !== "true" && (
              <button
                onClick={() => {
                  const pinSet = localStorage.getItem("pin_set");
                  if (pinSet === "true") {
                  toast.info("PIN is already set");
                  return;
                  }
                  setShowSetPin(true);
                }}
                className="flex items-center gap-2 w-full text-left text-base rounded-xl my-1 py-2 px-3 hover:bg-alice-teal/10 text-gray-700 hover:text-alice-teal"
              >
                <Lock className="w-5 h-5" />
                Set Pin
              </button>
            )}

              <hr className="my-1 border-gray-200" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left text-base text-gray-700 hover:text-alice-teal rounded-xl my-1 py-2 px-3 hover:bg-alice-teal/10"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={formData.current_password}
                  onChange={(e) =>
                    setFormData({ ...formData, current_password: e.target.value })
                  }
                  className={`w-full border ${errors.current_password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-alice-teal"
                    } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.current_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>
                )}
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                  className={`w-full border ${errors.new_password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-alice-teal"
                    } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.new_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({ ...formData, confirm_password: e.target.value })
                  }
                  className={`w-full border ${errors.confirm_password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-alice-teal"
                    } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-lg bg-alice-teal text-white font-semibold hover:bg-teal-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? "Saving..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Pin Modal */}
      {showSetPin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Set Pin
            </h3>

            <form onSubmit={handleSetPin} className="space-y-4">
              
              {/* Set Pin */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pin <span className="text-red-500">*</span>
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  value={pinData.pin}
                  onChange={(e) =>
                    setPinData({ ...pinData, pin: e.target.value })
                  }
                  className={`w-full border ${errors.pin
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-alice-teal"
                    } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.pin && (
                  <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
                )}
              </div>

              {/* Confirm Pin */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Pin <span className="text-red-500">*</span>
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={pinData.confirm_pin}
                  onChange={(e) =>
                    setPinData({ ...pinData, confirm_pin: e.target.value })
                  }
                  className={`w-full border ${errors.confirm_pin
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-alice-teal"
                    } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirm_pin && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_pin}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSetPin(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-lg bg-alice-teal text-white font-semibold hover:bg-teal-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? "Saving..." : "Set Pin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
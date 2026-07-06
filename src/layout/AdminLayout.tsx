import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "../components/common/admin/AdminSidebar";
import { Header } from "../components/common/admin/adminHeader";
import { AdminChatbot } from "../components/common/admin/AdminChatbot";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/common/Footer";
import { useEffect, useState } from "react";
import { changePassword } from "../api/api-services";
import { toast } from "react-toastify";
import { EyeOff, Eye } from "lucide-react";
// import { Header } from "./Header";

interface DashboardLayoutProps {
  requireAuth?: boolean;
}

type AuthMeta = {
  mustChangePassword: boolean;
  message: string;
  password: string;
};

const AdminLayout: React.FC<DashboardLayoutProps> = ({ requireAuth = true }) => {
  const { user, isLoading } = useAuth();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Chatbot open state, lifted here so the main content can shift when it opens
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [authMeta, setAuthMeta] = useState<AuthMeta | null>(() => {
    const stored = sessionStorage.getItem("authMeta");
    return stored ? JSON.parse(stored) : null;
  });


  // Form data and validation
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  useEffect(() => {
    if (authMeta?.mustChangePassword) {
      setShowChangePassword(true);
      setFormData({ ...formData, current_password: authMeta.password });
    }
  }, [authMeta]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        if (authMeta) {
          setAuthMeta(null);
          sessionStorage.removeItem('authMeta');
        }
      } else {
        toast.error(response.Message || "Failed to change password.");
      }
    } catch (error: any) {
      toast.error(error?.Message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden overflow-y-auto">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-[margin] duration-300 ease-in-out ${
          isChatOpen ? "mr-[420px]" : "mr-0"
        }`}
      >
        <Header />
        <main className="flex-1  overflow-auto p-6">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* Floats above every admin page rendered through this layout.
          Keeps its own in-memory chat state only - no session/local storage.
          isOpen is owned here so the main content column can shift, rather
          than the panel overlapping page content underneath it. */}
      <AdminChatbot isOpen={isChatOpen} onOpenChange={setIsChatOpen} />

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
                  disabled={authMeta?.mustChangePassword}
                  onClick={() => setShowChangePassword(false)}
                  className={`px-4 py-2 rounded-lg transition ${authMeta?.mustChangePassword
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                    }`}                >
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
    </div>
  );
};

export default AdminLayout;
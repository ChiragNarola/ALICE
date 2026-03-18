// PinLogin.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { verifyPin } from "../api/api-services";

export default function PinLogin() {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const savedEmail = localStorage.getItem("user_email");

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin.match(/^\d{4}$/)) {
      toast.error("PIN must be 4 digits");
      return;
    }

    setLoading(true);
    try {
      const formDataPin = new FormData();
      formDataPin.append("email", savedEmail || "");
      formDataPin.append("pin", pin);

      const res = await verifyPin(formDataPin);


      if (res?.IsSuccess) {
        // PIN valid → automatically log in
        const formData = new FormData();
        formData.append("username", savedEmail!);
        formData.append("password", pin); // Using PIN as password
        formData.append("login_type", "pin");
        const response = await login(formData, true);

        if (response?.IsSuccess) {
          toast.success("Logged in via PIN");
          navigate("/");
        } else {
          toast.error("Login failed");
        }
      } else {
        toast.error("Invalid PIN");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-8 rounded-2xl border shadow-md">
      <h2 className="text-2xl font-bold text-center mb-2">Login using PIN</h2>
      <p className="text-gray-600 text-sm text-center mb-6">
        Quick access with your 4-digit security PIN
      </p>

      <form onSubmit={submitPin} className="space-y-4">
        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter 4-digit PIN"
            className="border w-full p-3 rounded-xl pr-12 text-base outline-none focus:border-teal-600 transition"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-[11px] text-gray-500 hover:text-black"
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* PIN Login */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
        >
          {loading ? "Checking..." : "Login with PIN"}
        </button>

        {/* Normal Login Button */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full border border-teal-600 text-teal-700 font-semibold py-3 rounded-xl hover:bg-teal-600 hover:text-white transition"
        >
          Login with Email & Password
        </button>
      </form>
</div>
  );
}

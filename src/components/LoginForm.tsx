import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import type { LoginFormInputs } from "../routes/models/request/Auth";
import "react-phone-input-2/lib/style.css";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useChildren } from "../contexts/ChildrenContext";

const LoginForm = () => {
  const { login, logout } = useAuth();
  const { clearChild } = useChildren();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({ mode: "onChange" });

  const savedPinSet = localStorage.getItem("pin_set");
  const savedPinEmail = localStorage.getItem("user_email");

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      const response = await login(
        {
          username: data.username,
          password: data.password,
        },
        rememberMe
      );

      if (response?.IsSuccess) {
        clearChild();
        const roles = response.Data?.user?.roles ?? [];
        const role = roles[0];

        if (response.Data.must_change_password) {
          const metaData = {
            mustChangePassword: response.Data.must_change_password,
            message: response.Message,
            password: data.password,
          };
          sessionStorage.setItem("authMeta", JSON.stringify(metaData));
        }

        if (role === "staff" || role === "parent") {
          toast.success("Login successful");

          const pinSet = localStorage.getItem("pin_set");

          if (pinSet === "false") {
            navigate("/child-basic-info");
            return;
          }

          navigate("/");
        } else {
          toast.error("Access denied. Only staff or parent can login.");
          logout();
        }
      } else {
        toast.error("Login failed");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.Message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">
        Login to your account
      </h2>
      <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">
        Welcome back! Please enter your details
      </p>

      {/* PIN Quick Login — only if pin is set */}
      {savedPinEmail && savedPinSet === "true" && (
        <div className="flex items-center justify-between gap-3 p-3 mb-6 2xl:mb-9 rounded-xl bg-[#F5FBFA] border border-alice-teal/20">
          <div className="text-left">
            <p className="text-[13px] lg:text-sm font-semibold text-alice-black">
              Quick login available
            </p>
            <p className="text-[12px] lg:text-xs text-alice-darkgray">
              You've set up a 4-digit PIN for faster access.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/pin-login")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-alice-teal text-[13px] lg:text-sm font-semibold text-alice-teal bg-white hover:bg-alice-teal hover:text-white transition-colors duration-200"
          >
            <KeyRound size={16} />
            Use PIN
          </button>
        </div>
      )}

      {/* Email Field */}
      <div className="mb-6">
        <label
          htmlFor="email"
          className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]"
        >
          <span className="bg-[#FEFCF8] px-[5px]">Email</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="off"
          placeholder="Johndoe@gmail.com"
          {...register("username", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email format",
            },
          })}
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-6 relative">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">
            Password <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full pr-12 px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-[35px] text-alice-darkgray"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me + Forgot Password */}
      <div className="flex items-center justify-between mb-6 2xl:mb-9 gap-3 flex-wrap">
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0"
          />
          Keep me logged in
        </label>

        <NavLink
          to="/forgotpassword"
          className="text-alice-teal font-semibold text-[14px] lg:text-base hover:underline"
        >
          Forgot Password?
        </NavLink>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9
          ${loading ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Login...
          </div>
        ) : (
          "Login"
        )}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-[14px] lg:text-base text-alice-black font-semibold mt-4">
        Don't have an account?{" "}
        <NavLink
          to="/signup"
          className="text-alice-teal font-medium hover:underline"
        >
          Signup for free
        </NavLink>
      </p>

      {/* App Download Badges */}
      <div className="flex items-center justify-center gap-3 mt-4">
          <a
          href="https://play.google.com/store/apps/details?id=com.aliceAi"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Get it on Google Play"
            className="h-[38px] lg:h-[42px]"
          />
        </a>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="Download on the App Store"
            className="h-[38px] lg:h-[42px]"
          />
        </a>
      </div>

      {/* Guest Button — hidden for registered users */}
      {!savedPinEmail && (
        <div className="mt-6 flex flex-col items-center">
          <div className="relative w-full flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-alice-gray"></div>
            </div>
            <div className="relative px-4 bg-[#FEFCF8] text-sm text-alice-darkgray font-medium">
              OR
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/guest-chat")}
            className="w-full border-2 border-alice-teal text-alice-teal hover:bg-alice-teal hover:text-white text-base font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-all ease-in-out duration-300"
          >
            Try as Guest
          </button>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
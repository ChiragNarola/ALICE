import { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyEmailCode } from "../api/api-services";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailCode, setEmailCode] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") || "";

  const handleVerifyCode = async () => {
    if (!/^\d{6}$/.test(emailCode)) {
      return toast.error("Please enter a valid 6-digit code");
    }

    setLoading(true);
    try {
      const response = await verifyEmailCode(emailCode);
      if (response.IsSuccess) {
        toast.success("Email verified successfully!");
        navigate("/login");
      } else {
        toast.error(response.Message || "Invalid verification code");
      }
    } catch (err: any) {
      toast.error(err.Message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FEFCF8] pr-20   pb-10">
      <div className="w-full max-w-lg"> {/* Centered container */}
        <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35] mb-4">
          Email Verification
        </h2>
        <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mb-8">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        {/* Verification Code Field */}
        <div className="mb-8">
          <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
            <span className="bg-[#FEFCF8] px-[5px]">
              Verification Code <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            type="text"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value.replace(/\D/, ""))}
            maxLength={6}
            placeholder="Enter 6-digit code"
            className="w-full px-6 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal text-center tracking-widest"
          />
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={loading}
          className={`w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-8 flex justify-center items-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend & Go Back Links */}
<div className="text-[14px] lg:text-base text-alice-darkgray font-medium mt-4">
  <p>
    A verification code has been sent to <strong>{email}</strong>.{" "}
    If the code is expired, a new one will be sent automatically (managed by backend).
  </p>
</div>

      </div>
    </div>
  );
};

export default EmailVerification;

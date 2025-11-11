import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyEmailCode } from "../api/api-services";

const emailVerificationSchema = z.object({
  emailCode: z
    .string()
    .min(6, "Code must be exactly 6 digits")
    .max(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must be a valid 6-digit number"), // only digits
});

type EmailVerificationForm = z.infer<typeof emailVerificationSchema>;

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EmailVerificationForm>({
    resolver: zodResolver(emailVerificationSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: EmailVerificationForm) => {
    setLoading(true);
    try {
      const response = await verifyEmailCode(data.emailCode);
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
    <div className="flex justify-center lg:justify-start items-center min-h-[50vh] md:min-h-screen lg:mr-10 bg-[#FEFCF8] px-4 sm:px-6 md:px-10 lg:px-20 pb-8">
      <div className="w-full max-w-lg">
        {/* Heading */}
        <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">
          Email Verification
        </h2>

        <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Verification Code Field */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
              <span className="bg-[#FEFCF8] px-[5px]">
                Verification Code <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              {...register("emailCode")}
              onChange={(e) => {
                // Allow only digits
                const value = e.target.value.replace(/\D/g, "");
                setValue("emailCode", value, { shouldValidate: true });
              }}
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px]
                focus:outline-none 
                ${errors.emailCode ? "border-red-500" : "border-alice-gray"}
                bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black 
                text-[14px] lg:text-base font-normal text-center tracking-widest`}
            />

            {/* Error Message */}
            {errors.emailCode && (
              <p className="text-red-500 text-sm mt-2">
                {errors.emailCode.message}
              </p>
            )}
          </div>

          <p className="text-[13px] text-alice-darkgray mt-1 text-center">
            Didn’t receive the code? Check your junk inbox.
          </p>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold 
              py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 
              mb-6 2xl:mb-9 flex justify-center items-center
              ${loading ? "opacity-70 cursor-not-allowed" : ""}
            `}
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

          {/* Info Text */}
          <div className="text-[14px] lg:text-base text-alice-darkgray font-medium text-center sm:text-left mt-4">
            <p>
              Verification code has been sent to your registered email{" "}
              <strong>{email}</strong>. If the code expires, a new one will be sent automatically.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import 'react-phone-input-2/lib/style.css';
import { resetPassword } from "../api/api-services";

type ResetPasswordFormValues = {
  reset_code: string;
  new_password: string;
  confirm_password: string;
};

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ mode: 'onChange' });

  const newPassword = watch('new_password');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      const response = await resetPassword(data.reset_code, data.new_password);

      if (response.IsSuccess) {
        toast.success('Password reset successfully. Please log in.');
        navigate("/login");
      } else {
        toast.error(response.Message || 'Password reset failed');
      }
    } catch (err: any) {
      toast.error(err?.Message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">
        Reset Password
      </h2>

      <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12"></p>

      {/* Reset Code Field */}
      <div className="mb-6">
        <label
          htmlFor="reset_code"
          className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]"
        >
          <span className="bg-[#FEFCF8] px-[5px]">
            Reset Code<span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="reset_code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit reset code"
          {...register("reset_code", {
            required: "Reset code is required",
            pattern: {
              value: /^[0-9]{6}$/,
              message: "Reset code must be 6 digits",
            },
          })}
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal tracking-[2px]"
        />
        {errors.reset_code && (
          <p className="text-red-500 text-sm mt-1">
            {errors.reset_code.message}
          </p>
        )}
      </div>

      {/* New Password Field */}
      <div className="relative mb-6">
        <label
          htmlFor="new_password"
          className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]"
        >
          <span className="bg-[#FEFCF8] px-[5px]">
            New Password<span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="new_password"
          type={showNewPassword ? 'text' : 'password'}
          placeholder="Enter your new password"
          {...register('new_password', {
            required: 'New password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, message: 'Password must include uppercase, lowercase, and special character' },
          })}
          className="block w-full px-5 py-[14px] lg:py-[18px] pr-10 border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-5 top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.new_password && (
          <p className="text-sm text-red-600 mt-1">
            {errors.new_password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="relative mb-8">
        <label
          htmlFor="confirm_password"
          className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]"
        >
          <span className="bg-[#FEFCF8] px-[5px]">
            Confirm Password<span className="text-red-500">*</span>
          </span>
        </label>
        <input
          id="confirm_password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your new password"
          {...register('confirm_password', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === newPassword || 'Passwords do not match',
          })}
          className="block w-full px-5 py-[14px] lg:py-[18px] pr-10 border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-5 top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.confirm_password && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 text-sm font-semibold text-white bg-alice-teal hover:bg-teal-700 rounded-md transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </div>
        ) : (
          'Reset Password'
        )}
      </button>

      <p className="text-center text-sm text-gray-700 mt-4">
        Remember your password?{' '}
        <NavLink
          to="/login"
          className="text-alice-teal font-medium hover:underline"
        >
          Login
        </NavLink>
      </p>
    </form>
  );
};

export default ResetPasswordForm;
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-phone-input-2/lib/style.css';
import { forgotPassword } from "../api/api-services";

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPasswordForm = () => {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ mode: 'onChange' });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const response = await forgotPassword(data.email);

      if (response.IsSuccess) {
        toast.success('Reset instructions sent to your email');
        navigate("/resetpassword");
      } else {
        toast.error(response.Message || 'Failed to send reset email');
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
        Forgot Password
      </h2>

      <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">

      </p>
      {/* Email Field */}
      <div className="mb-6">
        <label
          htmlFor="email"
          className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]"
        >
          <span className="bg-[#FEFCF8] px-[5px]">Email address<span className="text-red-500">*</span></span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="off"
          placeholder="Johndoe@gmail.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email format",
            },
          })}
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
            Sending...
          </div>
        ) : (
          'Submit'
        )}
      </button>
      <p className="text-center text-sm text-gray-700 mt-2">
        Already have an account? {' '}
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

export default ForgotPasswordForm;

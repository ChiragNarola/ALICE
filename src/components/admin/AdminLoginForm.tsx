import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginFormInputs } from '../../routes/models/request/Auth';
import 'react-phone-input-2/lib/style.css';
import { Eye, EyeOff } from 'lucide-react';

const AdminLoginForm = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>({ mode: 'onChange' });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);

      const response = await login(formData);

      if (response?.IsSuccess) {
        const roles = response.Data?.user?.roles ?? [];

        if (roles.includes("admin")) {
          toast.success("Login successful");
          navigate("/admin/dashboard");
        } else {
          toast.error("Access denied. Admins only.");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5  bg-white px-2 ">
      {/* Email Field */}
      <div className='mt-5'>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="off"
          placeholder="your@email.com"
          {...register('username', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email format',
            },
          })}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 bg-[#FEFCF8] text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-alice-teal focus:border-alice-teal transition"
        />
        {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
      </div>

      {/* Password Field */}
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
          Password
        </label>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Min 8 characters' },
            // pattern: {
            //   value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
            //   message: 'Must include upper, lower & special char',
            // },
          })}
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          className="block w-full px-4 py-3 pr-10 rounded-md border border-gray-300 bg-[#FEFCF8] text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-alice-teal focus:border-alice-teal transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {/* Options */}
      <div className="flex items-center justify-between text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 text-alice-teal border-gray-300 focus:ring-alice-teal" />
          Keep me logged in
        </label>
        {/* <NavLink to="/admin/forgot-password" className="text-alice-teal hover:underline font-medium">Forgot password?</NavLink> */}
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
            Logging in...
          </div>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
};

export default AdminLoginForm;
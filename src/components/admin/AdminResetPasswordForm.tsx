import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';

const AdminResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string }>({
    mode: 'onChange',
  });

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      // TODO: Replace with actual reset password logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Password reset successful!');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5  bg-white px-2 ">
      <h2 className="text-2xl font-semibold text-gray-900">Reset Password</h2>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
          New Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter new password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 bg-[#FEFCF8] text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-alice-teal focus:border-alice-teal transition"
        />
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter new password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match',
          })}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 bg-[#FEFCF8] text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-alice-teal focus:border-alice-teal transition"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 text-sm font-semibold text-white bg-alice-teal hover:bg-teal-700 rounded-md transition duration-200 ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Updating...
          </div>
        ) : (
          'Reset Password'
        )}
      </button>

      <p className="text-center text-sm text-gray-700">
        Return to{' '}
        <NavLink to="/admin/login" className="text-alice-teal font-medium hover:underline">
          Login
        </NavLink>
      </p>
    </form>
  );
};

export default AdminResetPasswordForm;

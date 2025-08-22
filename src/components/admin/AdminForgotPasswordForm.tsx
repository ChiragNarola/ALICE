import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';

const AdminForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    mode: 'onChange'
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Replace this with your actual forgot password request
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Reset instructions sent to your email');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5  bg-white px-2">
      <h2 className="text-2xl font-semibold text-gray-900">Forgot Password</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="off"
          placeholder="your@email.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email format',
            },
          })}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 bg-[#FEFCF8] text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-alice-teal focus:border-alice-teal transition"
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
      </div>

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
          'Send Reset Link'
        )}
      </button>

      <p className="text-center text-sm text-gray-700">
        Remembered your password?{' '}
        <NavLink to="/admin/login" className="text-alice-teal font-medium hover:underline">
          Login
        </NavLink>
      </p>
    </form>


  );
};

export default AdminForgotPasswordForm;

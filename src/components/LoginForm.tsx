import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/child-basic-info');
  };

  return (
    <form onSubmit={handleLogin}>
      <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">Login to your account</h2>
      <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">Welcome back! Please enter your details</p>
      <div className="mb-6">
        <label htmlFor="email" className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Email</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="Johndoe@gmail.com"
          required
          autoComplete="off"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="email" className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Password</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="off"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
      </div>
      <div className="flex items-center justify-between mb-6 2xl:mb-9 gap-3 flex-wrap">
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray">
          <input
            type="checkbox"
            className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0"
          />
          Keep me logged in
        </label>
        <a href="#" className="text-alice-teal font-semibold text-[14px] lg:text-base hover:underline">Forgot Password?</a>
      </div>
      <button type="submit" className="w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9">Login</button>
      <p className="text-center text-[14px] lg:text-base text-alice-black font-semibold">
        Don’t have an account? <NavLink to="/signup" className="text-alice-teal font-medium hover:underline">Signup for free</NavLink>
      </p>
    </form>
  );
};

export default LoginForm; 
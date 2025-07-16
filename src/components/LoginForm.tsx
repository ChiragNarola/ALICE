import React from 'react';

const LoginForm = () => (
  <form>
    <h2 className="text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-[#1B1B1B] leading-[1.35]">Login to your account</h2>
    <p className="text-base lg:text-lg font-normal leading-[1.5] text-[#5E5E5E] mt-[10px] mb-10 2xl:mb-12">Welcome back! Please enter your details</p>
    <div className="mb-6">
      <label htmlFor="email" className="block text-left text-base font-semibold text-[#1B1B1B] relative ms-[12px] mt-[2px]">
        <span className="bg-[#FEFCF8] px-[5px]">Email</span>
      </label>
      <input
        id="email"
        type="email"
        placeholder="Johndoe@gmail.com"
        required
        className="w-full px-5 py-[18px] border border-[#1B1B1B1A] rounded-[12px] focus:outline-none focus:border-[#008080] mt-[-12px] bg-[#FEFCF8] placeholder:text-[#5E5E5E] text-[#1B1B1B] font-base font-normal"
      />
    </div>
    <div className="mb-6">
    <label htmlFor="email" className="block text-left text-base font-semibold text-[#1B1B1B] relative ms-[12px] mt-[2px]">
        <span className="bg-[#FEFCF8] px-[5px]">Password</span>
      </label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        required
        className="w-full px-5 py-[18px] border border-[#1B1B1B1A] rounded-[12px] focus:outline-none focus:border-[#008080] mt-[-12px] bg-[#FEFCF8] placeholder:text-[#5E5E5E] text-[#1B1B1B] font-base font-normal"
      />
    </div>
    <div className="flex items-center justify-between mb-6 2xl:mb-9">
      <label className="flex items-center text-base text-[#5E5E5E] font-normal">
        <input type="checkbox" className="mr-[10px] accent-teal-600" />
        Keep me logged in
      </label>
      <a href="#" className="text-[#008080] font-semibold text-base hover:underline">Forgot Password?</a>
    </div>
    <button type="submit" className="w-full bg-[#008080] hover:bg-teal-800 text-base text-white font-semibold py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9">Login</button>
    <p className="text-center text-base text-[#1B1B1B] font-semibold">
      Don’t have an account? <a href="#" className="text-[#008080] font-medium hover:underline">Signup for free</a>
    </p>
  </form>
);

export default LoginForm; 
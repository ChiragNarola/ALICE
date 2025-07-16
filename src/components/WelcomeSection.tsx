import React from 'react';
import logo from '../assets/images/logo.svg';
import login_img from '../assets/images/login-bg.svg';

const WelcomeSection = () => (
  <>
  {/* Logo */}
  <div className="mb-10 2xl:mb-14">
    <img src={logo} alt="Logo" className="h-15" />
  </div>
  <div className="flex flex-col items-center justify-center text-center w-full flex-1">
    {/* Heading */}
    <h1 className="text-[36px] xl:text-[44px] 2xl:text-[54px] font-bold text-[#1B1B1B] leading-[1.5]">Welcome to A.L.I.C.E.</h1>
    <p className="text-[#5E5E5E] text-lg 2xl:text-xl font-normal mb-6 xl:mb-10 2xl:mb-[70px]">Your AI-powered parenting guide for trusted advice and support</p>
    {/* Illustration Placeholder */}
    <div className="max-w-[735px] w-full flex items-center justify-center">
      {/* Replace with SVG or image as needed */}
      <img src={login_img} alt="Login Image" className="w-full h-full" />
    </div>
  </div>
  </>
);

export default WelcomeSection; 
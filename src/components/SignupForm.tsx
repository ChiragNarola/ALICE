// import React, { useState, type ChangeEvent } from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
// import PhoneInput, { type CountryData } from 'react-phone-input-2';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const SignupForm = () => {
  const [phone, setPhone] = useState('');

  return (
    <form>
    <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">Signup</h2>
    <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">Create a new account for free</p>
    <div className="flex flex-col sm:flex-row sm:gap-6 md:gap-4 lg:gap-6">
      <div className="mb-6 flex-1">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">First Name</span>
        </label>
        <input
          type="text"
          placeholder="First Name"
          required
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
      </div>
      <div className="mb-6 flex-1">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Last Name</span>
        </label>
        <input
          type="text"
          placeholder="Last name"
          required
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
      </div>
    </div>
    <div className="mb-6 flex-1">
      <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px] z-10">
        <span className="bg-[#FEFCF8] px-[5px]">Mobile Number</span>
      </label>
      <PhoneInput
        country={'us'}
        value={phone}
        onChange={setPhone}
        inputProps={{
          required: true,
          name: 'mobile',
          placeholder: '(839) 000-0000',
        }}
        containerClass="w-full mt-[-10px] lg:mt-[-12px]"
        inputClass="!w-full px-5 py-[14px] lg:py-[18px] !border !border-alice-gray !rounded-[12px] !focus:outline-none focus:!border-alice-teal !bg-[#FEFCF8] placeholder:!text-alice-darkgray !text-alice-black !text-[14px] lg:!text-base !font-normal !h-auto"
        buttonClass="!bg-transparent !border-none"
        dropdownClass="!bg-[#FEFCF8] !text-alice-black"
      />
    </div>
    <div className="mb-6">
      <label htmlFor="email" className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
        <span className="bg-[#FEFCF8] px-[5px]">Email</span>
      </label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        required
        className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
      />
    </div>
    <div className="mb-6">
      <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
        <span className="bg-[#FEFCF8] px-[5px]">Password</span>
      </label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        required
        className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
      />
    </div>
    <div className="mb-6">
      <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
        <span className="bg-[#FEFCF8] px-[5px]">Confirm Password</span>
      </label>
      <input  
        id="password"
        type="password"
        placeholder="Confirm Password"
        required
        className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
      />
    </div>
    {/* <div className="parent_staff_wrapper">
        
    </div> */}
    <div className="flex flex-row gap-6 sm:gap-12 mb-6">
      <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
        <input type="checkbox" className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0" />
        Parent
      </label>
      <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
        <input type="checkbox" className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0" />
        Staff
      </label>
    </div>
    <button type="submit" className="w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9 md:mt-3">Create Account</button>
    <p className="text-center text-[14px] lg:text-base text-alice-black font-semibold">
      Already have an account? <NavLink to="/login" className="text-alice-teal font-medium hover:underline">Login</NavLink>
    </p>
  </form>
  );
};

export default SignupForm;
// function setPhone(value: string, data: {} | CountryData, event: ChangeEvent<HTMLInputElement>, formattedValue: string): void {
//   console.log(formattedValue, value, data, event)
//   throw new Error('Function not implemented.');
// }

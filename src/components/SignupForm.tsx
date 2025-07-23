// import React, { useState, type ChangeEvent } from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useForm } from 'react-hook-form';
import { registerUser } from '../api/api-services';
import { toast } from 'react-toastify';

type SignupFormInputs = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  location: string;
  contact_number: string;
  role: string[];// ['Parent', 'Staff']
  confirmPassword: string;
};

const SignupForm = () => {
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SignupFormInputs>({ mode: 'onChange', defaultValues: { role: [] }, });

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      const updatedData = {
        ...data,
        contact_number: phone,
      };
      const response = await registerUser(updatedData);
      // console.log(response);
      if (response === "User Created!") {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.info(response?.message || "Registered, but please check your email.");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };


  const handleRoleChange = (role: string) => {
    const updatedRoles = roles.includes(role)
      ? roles.filter((r) => r !== role)
      : [...roles, role];

    setRoles(updatedRoles);
    setValue('role', updatedRoles, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">Signup</h2>
      <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">Create a new account for free</p>
      <div className="flex flex-col sm:flex-row sm:gap-6 md:gap-4 lg:gap-6">
        <div className="mb-6 flex-1">
          <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
            <span className="bg-[#FEFCF8] px-[5px]">First Name <span className="text-red-500">*</span></span>
          </label>
          <input
            {...register('first_name', { required: 'First name is required' })}
            type="text"
            placeholder="First Name"
            className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
        </div>

        <div className="mb-6 flex-1">
          <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
            <span className="bg-[#FEFCF8] px-[5px]">Last Name <span className="text-red-500">*</span></span>
          </label>
          <input
            {...register('last_name', { required: 'Last name is required' })}
            type="text"
            placeholder="Last Name"
            className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
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
            // required: true,
            name: 'contact_number',
            placeholder: '(839) 000-0000',
          }}
          containerClass="w-full mt-[-10px] lg:mt-[-12px]"
          inputClass="!w-full px-5 py-[14px] lg:py-[18px] !border !border-alice-gray !rounded-[12px] !focus:outline-none focus:!border-alice-teal !bg-[#FEFCF8] placeholder:!text-alice-darkgray !text-alice-black !text-[14px] lg:!text-base !font-normal !h-auto"
          buttonClass="!bg-transparent !border-none"
          dropdownClass="!bg-[#FEFCF8] !text-alice-black"
        />
      </div>
      <div className="mb-6 flex-1">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Location </span>
        </label>
        <input
          {...register('location')}
          type="text"
          placeholder="Example: Wales, Scotland etc"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="email" className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Email <span className="text-red-500">*</span></span>
        </label>

        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
          })}
          type="email"
          placeholder="Email"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Password <span className="text-red-500">*</span></span>
        </label>

        <input
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
              message: 'Password must include uppercase, lowercase, and special character',
            },
          })}
          type="password"
          placeholder="Password"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Confirm Password <span className="text-red-500">*</span></span>
        </label>
        <input
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match'
          })}
          type="password"
          placeholder="Confirm Password"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>
      {/* <div className="parent_staff_wrapper">
        
    </div> */}
      <div className="flex flex-row gap-6 sm:gap-12 mb-6">
        <input
          type="hidden"
          {...register('role', {
            validate: (value) => value.length > 0 || 'Please select at least one role',
          })}
        />
        {/* <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input type="checkbox" className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0" />
          Parent
        </label> */}
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0"
            checked={roles.includes('parent')}
            onChange={() => handleRoleChange('parent')}
          />
          Parent
        </label>
        {/* <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input type="checkbox" className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0" />
          Staff
        </label> */}
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0"
            checked={roles.includes('staff')}
            onChange={() => handleRoleChange('staff')}
          />
          Staff
        </label>
      </div>
      {errors.role && (
        <p className="text-red-500 text-sm mt-[-12px] mb-4">{errors.role.message}</p>
      )}
      <button type="submit" className="w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9 md:mt-3">Create Account</button>
      <p className="text-center text-[14px] lg:text-base text-alice-black font-semibold">
        Already have an account? <NavLink to="/login" className="text-alice-teal font-medium hover:underline">Login</NavLink>
      </p>
    </form>
  );
};

export default SignupForm;
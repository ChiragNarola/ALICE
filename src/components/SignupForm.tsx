// import React, { useState, type ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useForm, Controller } from 'react-hook-form';
import { fetchCountries, registerUser } from '../api/api-services';
import { toast } from 'react-toastify';
import type { SignupFormInputs } from '../routes/models/request/Auth';
import { Eye, EyeOff } from 'lucide-react';

const SignupForm = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [locationType, setLocationType] = useState<'country' | 'pincode'>('country');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm<SignupFormInputs>({ mode: 'onChange', defaultValues: { role: [] }, });

  const onSubmit = async (data: SignupFormInputs) => {
    setLoading(true);
    try {
      const updatedData = {
        ...data,
        contact_number: phone,
      };
      const response = await registerUser(updatedData);
      if (response.IsSuccess) {
        setLoading(false);
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error(response.Message || "Registered, but please check your email.");
      }
    } catch (err: any) {
      toast.error(err.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    const updatedRoles = roles.includes(role)
      ? roles.filter((r) => r !== role)
      : [...roles, role];

    setRoles(updatedRoles);
    setValue('role', updatedRoles, { shouldValidate: true });
  };

  useEffect(() => {
    const getCountries = async () => {
      const countryList = await fetchCountries();
      setCountries(countryList);
    };

    getCountries();
  }, []);

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
          country={'gb'}
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

      {/* Toggle between country and pincode */}
      <div className="mb-6 flex gap-4">
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input
            type="radio"
            value="country"
            checked={locationType === 'country'}
            onChange={() => { setLocationType('country'); setValue('location', ''); }}
            className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0"
          />
          Country
        </label>
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input
            type="radio"
            value="pincode"
            checked={locationType === 'pincode'}
            onChange={() => { setLocationType('pincode'); setValue('location', ''); }}
            className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0"
          />
          Pincode
        </label>
      </div>

      {/* Location input based on toggle */}
      <div className="mb-6 flex-1">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Location</span>
        </label>

        <Controller
          name="location"
          control={control}
          rules={{ required: 'Location is required' }}
          render={({ field }) => (
            locationType === 'country' ? (
              <select
                {...field}
                className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] text-alice-black text-[14px] lg:text-base font-normal"
              >
                <option value="" disabled>Select Country</option>
                {countries.map((country: any) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register('location', {
                  // required: 'Postal Code is required',
                  pattern: {
                    value: /^[A-Za-z0-9\s\-]{3,10}$/,
                    message: 'Enter a valid postal code',
                  },
                })}
                type="text"
                placeholder="Postal Code"
                className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
              />
            )
          )}
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
      <div className="mb-6 relative">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">
            Password <span className="text-red-500">*</span>
          </span>
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
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="w-full pr-12 px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />

        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-4 top-[35px] text-alice-darkgray"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-6 relative">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Confirm Password <span className="text-red-500">*</span></span>
        </label>
        <input
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match'
          })}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(prev => !prev)}
          className="absolute right-4 top-[35px] text-alice-darkgray"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
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
      {/* <button type="submit" className="w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9 md:mt-3">Create Account</button> */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9 md:mt-3 ${loading ? "opacity-70 cursor-not-allowed" : ""} `}>
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating...
          </div>
        ) : (
          "Create Account"
        )}
      </button>

      <p className="text-center text-[14px] lg:text-base text-alice-black font-semibold">
        Already have an account? <NavLink to="/login" className="text-alice-teal font-medium hover:underline">Login</NavLink>
      </p>
    </form>
  );
};

export default SignupForm;
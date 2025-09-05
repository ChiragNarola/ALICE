import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useForm, Controller } from 'react-hook-form';
import { registerUser } from '../api/api-services';
import { toast } from 'react-toastify';
import type { SignupFormInputs } from '../routes/models/request/Auth';
import { Eye, EyeOff } from 'lucide-react';

const SignupForm = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [countries, setCountries] = useState<any[]>([]);
  // const [locationType, setLocationType] = useState<'country' | 'pincode'>('country');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    mode: 'onChange',
    defaultValues: { role: [] },
  });

  const onSubmit = async (data: SignupFormInputs) => {
    setLoading(true);
    try {
      const response = await registerUser(data);
      if (response.IsSuccess) {
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

  // useEffect(() => {
  //   const getCountries = async () => {
  //     const countryList = await fetchCountries();
  //     setCountries(countryList);
  //   };
  //   getCountries();
  // }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] 2xl:text-[36px] font-bold text-alice-black leading-[1.35]">Signup</h2>
      <p className="text-base lg:text-lg font-normal leading-[1.5] text-alice-darkgray mt-[10px] mb-6 sm:mb-8 md:mb-10 2xl:mb-12">Create a new account for free</p>

      <div className="flex flex-col sm:flex-row sm:gap-6 md:gap-4 lg:gap-6">
        {/* First Name */}
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

        {/* Last Name */}
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

      {/* Phone Input */}
      <div className="mb-6 flex-1">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px] z-10">
          <span className="bg-[#FEFCF8] px-[5px]">Mobile Number </span>
        </label>
        <Controller
          name="contact_number"
          control={control}
          rules={{
            // required: "Mobile number is required",
            validate: (value) => {
              if (!value) return false;
              if (!value.startsWith("44")) return "Phone number must start with UK code (+44)";
              if (value.length < 12 || value.length > 14) return "Enter a valid UK phone number";
              return true;
            },
          }}
          render={({ field }) => (
            <PhoneInput
              {...field}
              country="gb"
              disableDropdown
              onlyCountries={["gb"]}
              inputProps={{ placeholder: "(839) 000-0000" }}
              containerClass="w-full mt-[-10px] lg:mt-[-12px]"
              inputClass="!w-full px-5 py-[14px] lg:py-[18px] !border !border-alice-gray !rounded-[12px] !focus:outline-none focus:!border-alice-teal !bg-[#FEFCF8] placeholder:!text-alice-darkgray !text-alice-black !text-[14px] lg:!text-base !font-normal !h-auto"
              buttonClass="!bg-transparent !border-none"
              dropdownClass="!bg-[#FEFCF8] !text-alice-black"
              onChange={field.onChange}
            />
          )}
        />
        {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number.message}</p>}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:gap-6">
        {/* Country Field */}
        {/* <div className="flex-1">
          <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
            <span className="bg-[#FEFCF8] px-[5px]">Country <span className="text-red-500">*</span></span>
          </label>
          <Controller
            name="country"
            control={control}
            defaultValue="United Kingdom"
            rules={{ required: 'Country is required' }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] text-alice-black text-[14px] lg:text-base font-normal"
              >
                <option value="" disabled>Select Country</option>
                {countries.map((country: any) => (
                  <option key={country.name} value={country.name}>{country.name}</option>
                ))}
              </select>
            )}
          />
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
        </div> */}
        <div className="flex-1">
          <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
            <span className="bg-[#FEFCF8] px-[5px]">Country <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            value="United Kingdom"
            disabled
            className="w-full px-5 py-[14px] bg-[#f5f1f1] lg:py-[18px] border border-alice-gray rounded-[12px] bg-[#FEFCF8] text-alice-black text-[14px] lg:text-base font-normal mt-[-10px] lg:mt-[-12px] cursor-not-allowed"
          />
        </div>

        {/* Pincode Field */}
    <div className="flex-1">
  <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
    <span className="bg-[#FEFCF8] px-[5px]">Pincode</span>
  </label>

  <input
    {...register('location', {
      validate: (value) => {
        // ✅ Allow empty value (field is optional)
        if (!value || value.trim() === '') {
          return true; // no error when field is empty
        }

        // ✅ Validate only when there is a value
        const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}|GIR\s?0AA)$/i;
        return ukPostcodeRegex.test(value) || 'Enter a valid UK postal code';
      },
    })}
    type="text"
    placeholder="Postal Code"
    className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
  />

  {/* Show error message only when invalid */}
  {errors.location && (
    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
  )}
</div>


      </div>


      {/* Email */}
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

      {/* Password */}
      <div className="mb-6 relative">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Password <span className="text-red-500">*</span></span>
        </label>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, message: 'Password must include uppercase, lowercase, and special character' },
          })}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="w-full pr-12 px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-4 top-[35px] text-alice-darkgray">
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="mb-6 relative">
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Confirm Password <span className="text-red-500">*</span></span>
        </label>
        <input
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-[#FEFCF8] placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
        <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-4 top-[35px] text-alice-darkgray">
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      {/* Roles */}
      <div className="flex flex-row gap-6 sm:gap-12 mb-6">
        <input type="hidden" {...register('role', { validate: (value) => value.length > 0 || 'Please select at least one role' })} />
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input type="checkbox" className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0" checked={roles.includes('parent')} onChange={() => handleRoleChange('parent')} />
          Parent
        </label>
        <label className="flex items-center gap-3 text-[14px] lg:text-base xl:text-lg font-normal text-alice-darkgray cursor-pointer select-none">
          <input type="checkbox" className="w-6 h-6 border border-[#1B1B1B80] rounded-[4px] bg-[#FEFCF8] accent-alice-teal focus:ring-0" checked={roles.includes('staff')} onChange={() => handleRoleChange('staff')} />
          Staff
        </label>
      </div>
      {errors.role && <p className="text-red-500 text-sm mt-[-12px] mb-4">{errors.role.message}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-alice-teal hover:bg-teal-800 text-base text-white font-semibold py-[14px] lg:py-[18px] rounded-[12px] transition-colors ease-in-out duration-300 mb-6 2xl:mb-9 md:mt-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
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
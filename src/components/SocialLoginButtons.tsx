// import React from 'react';
import google_icon from '../assets/images/google-icon.svg';
import facebook_icon from '../assets/images/facebook-icon.svg';

const SocialLoginButtons = () => (
  <div className="flex justify-center space-x-6">
    <button className="flex items-center justify-center p-2 border border-alice-gray rounded-[12px] bg-white hover:border-alice-teal transition-colors ease-in-out duration-300 w-12 h-12 lg:w-[54px] lg:h-[54px] xl:w-[62px] xl:h-[62px]">
      <img src={google_icon} alt="Google Icon" className="h-5 lg:h-7" />
    </button>
    <button className="flex items-center justify-center p-2 border border-alice-gray rounded-[12px] bg-white hover:border-alice-teal transition-colors ease-in-out duration-300 w-12 h-12 lg:w-[54px] lg:h-[54px] xl:w-[62px] xl:h-[62px]">
      <img src={facebook_icon} alt="Facebook Icon" className="h-5 lg:h-7" />
    </button>
  </div>
);

export default SocialLoginButtons; 
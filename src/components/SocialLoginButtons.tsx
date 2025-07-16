import React from 'react';
import google_icon from '../assets/images/google-icon.svg';
import facebook_icon from '../assets/images/facebook-icon.svg';

const SocialLoginButtons = () => (
  <div className="flex justify-center space-x-6">
    <button className="flex items-center justify-center p-2 border border-[#1B1B1B1A] rounded-[12px] bg-white hover:border-[#008080] transition-colors ease-in-out duration-300 w-[54px] h-[54px] xl:w-[62px] xl:h-[62px]">
      <img src={google_icon} alt="Google Icon" />
    </button>
    <button className="flex items-center justify-center p-2 border border-[#1B1B1B1A] rounded-[12px] bg-white hover:border-[#008080] transition-colors ease-in-out duration-300 w-[54px] h-[54px] xl:w-[62px] xl:h-[62px]">
      <img src={facebook_icon} alt="Facebook Icon" />
    </button>
  </div>
);

export default SocialLoginButtons; 
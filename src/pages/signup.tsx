// import React from 'react';
import WelcomeSection from '../components/WelcomeSection';
import SocialLoginButtons from '../components/SocialLoginButtons';
import SignupForm from '../components/SignupForm';

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-alice-peach">
      {/* Left: Welcome Section */}
      <div className="md:w-1/2 flex flex-col py-5 px-5 sm:px-8 bg-alice-peach">
        <WelcomeSection />
      </div>
      {/* Right: Login Form Section */}
      <div className="md:w-1/2 flex items-center justify-center bg-[#FEFCF8] rounded-tl-[40px] rounded-tr-[40px] md:rounded-tr-none  md:rounded-tl-[100px] md:rounded-bl-[100px] shadow-[0px_4px_30px_#AF847B33] p-6 sm:p-8">
        <div className="w-full lg:w-[95%] max-w-[604px]">
          <SignupForm />
          <div className="my-6 2xl:my-9 flex items-center">
            <div className="flex-grow h-px bg-alice-gray" />
            <span className="mx-[10px] text-[14px] lg:text-base font-semibold text-alice-black">OR</span>
            <div className="flex-grow h-px bg-alice-gray" />
          </div>
          <SocialLoginButtons />
        </div>
      </div>
    </div>
  );
};

export default Signup;
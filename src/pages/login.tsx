import React from 'react';
import WelcomeSection from '../components/WelcomeSection';
import LoginForm from '../components/LoginForm';
import SocialLoginButtons from '../components/SocialLoginButtons';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdf6ef]">
      {/* Left: Welcome Section */}
      <div className="md:w-1/2 flex flex-col py-5 px-8 bg-[#fdf6ef]">
        <WelcomeSection />
      </div>
      {/* Right: Login Form Section */}
      <div className="md:w-1/2 flex items-center justify-center bg-[#FEFCF8] rounded-tl-3xl rounded-bl-3xl md:rounded-tl-[100px] md:rounded-bl-[100px] shadow-[0px_4px_30px_#AF847B33] p-8">
        <div className="w-[95%] max-w-[604px]">
          <LoginForm />
          <div className="my-6 2xl:my-9 flex items-center">
            <div className="flex-grow h-px bg-[#1B1B1B1A]" />
            <span className="mx-[10px] font-base font-semibold text-[#1B1B1B]">OR</span>
            <div className="flex-grow h-px bg-[#1B1B1B1A]" />
          </div>
          <SocialLoginButtons />
        </div>
      </div>
    </div>
  );
};

export default Login;

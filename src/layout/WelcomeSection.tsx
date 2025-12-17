import logo from '../assets/images/logo.svg';
import login_img from '../assets/images/login-bg.svg';
import { Outlet } from "react-router-dom";

const WelcomeSection = () => (
  <>
    <div className="min-h-screen flex flex-col md:flex-row bg-alice-peach">
      {/* Left: Welcome Section */}
      <div className="md:w-1/2 flex flex-col py-5 px-5 sm:px-8 bg-alice-peach">
        {/* Logo */}
        <div className="mb-8 sm:mb-10 2xl:mb-14">
          <img src={logo} alt="Logo" className="h-[60px] w-auto object-contain" />
        </div>
        <div className="flex flex-col items-center justify-center text-center w-full flex-1">
          {/* Heading */}
          <h1 className="text-[32px] sm:text-[36px] xl:text-[44px] 2xl:text-[54px] font-bold text-alice-black leading-[1.5]">
            Meet Alice
          </h1>
          <p className="text-alice-darkgray text-base sm:text-lg 2xl:text-xl font-normal mb-6 xl:mb-10 2xl:mb-[70px]">Your AI-powered childcare guide for trusted advice and support</p>
          {/* Illustration Placeholder */}
          <div className="max-w-[735px] w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[35vw] xl:w-[28vw] flex items-center justify-center">
            {/* Replace with SVG or image as needed */}
            <img src={login_img} alt="Login Image" className="w-full h-full" />
          </div>
        </div>
      </div>
      {/* Right: Login Form Section */}
      <div className="md:w-1/2 flex items-center justify-center bg-[#FEFCF8] rounded-tl-[40px] rounded-tr-[40px] md:rounded-tr-none  md:rounded-tl-[100px] md:rounded-bl-[100px] shadow-[0px_4px_30px_#AF847B33] p-6 sm:p-8">
        <div className="w-full lg:w-[95%] max-w-[604px]">
          <Outlet />
        </div>
      </div>
    </div>
  </>
);

export default WelcomeSection; 
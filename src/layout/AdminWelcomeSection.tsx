import logo from '../assets/images/logo.svg';
import { Outlet } from "react-router-dom";

const WelcomeSection = () => (
  <div className="w-screen h-screen bg-alice-peach flex items-center justify-center overflow-hidden px-4">
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-8 py-8">
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="Logo" className="h-10 mb-4" />
        <h1 className="text-xl font-semibold text-alice-black">Welcome to Alice Admin Panel</h1>
        <p className="text-sm text-alice-darkgray mt-1">
          Your AI-powered childcare guide
        </p>
      </div>
      <Outlet />
    </div>
  </div>
);

export default WelcomeSection;

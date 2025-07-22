import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import logo from '../assets/images/logo.svg';
// import userimg from '../assets/images/user-img.png';
import Step1ChildInfo from '../components/Step1ChildInfo';
import Step2GuidanceTopics from '../components/Step2GuidanceTopics';
import Step3CurrentConcerns from '../components/Step3CurrentConcerns';
import Step4ReviewSubmit from '../components/Step4ReviewSubmit';
import DashboardHeader from "../components/DashboardHeader";
import Footer from "../components/Footer";

const steps = [
  'Child’s Basic Information',
  'Topics of Guidance',
  'Current Concerns',
  'Review & Submit',
];

const ChildBasicInformation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMessageDropdown, setShowMessageDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const messageRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // const goToStep = (step: number) => setCurrentStep(step);
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleLogout = () => {
    // Clear authentication data if any
    localStorage.removeItem('token'); // or whatever key you use

    // Redirect to login page
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showMessageDropdown &&
        messageRef.current &&
        !messageRef.current.contains(event.target as Node)
      ) {
        setShowMessageDropdown(false);
      }
      if (
        showUserDropdown &&
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }

    if (showMessageDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMessageDropdown, showUserDropdown]);

  return (
    <div className="min-h-screen bg-[#FEFCF8] flex flex-col">
      {/* Header */}
      <DashboardHeader
        showMessageDropdown={showMessageDropdown}
        setShowMessageDropdown={setShowMessageDropdown}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        messageRef={messageRef}
        userRef={userRef}
        handleLogout={handleLogout}
      />
      <main className="flex flex-1 flex-col lg:flex-row px-4 sm:px-6 md:px-[30px] pt-4 sm:pt-6 md:pt-[30px] pb-4 sm:pb-6 gap-4 lg:gap-6">
        {/* Sidebar Wizard Navigation */}
        <aside className="lg:max-w-[320px] xl:max-w-[447px] w-full bg-white rounded-2xl border border-alice-gray p-4 lg:p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-[5px] text-alice-black">Child’s Profile</h2>
          <p className="text-sm text-alice-darkgray font-normal">Provide your child’s details to recieve personalized guidence and Support</p>
          <div className="border-t border-alice-gray my-4 md:my-6"></div>
          <ol className="relative">
            {steps.map((step, idx) => {
              // Step states
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              // const isUpcoming = idx > currentStep; // Not needed, but for clarity

              return (
                <li key={step} className="flex items-center relative min-h-[30px] lg:min-h-[50px] mb-[24px] lg:mb-[50px] last:mb-0">
                  {/* Vertical line */}
                  {idx !== steps.length - 1 && (
                    <span
                      className={`absolute left-[14px] lg:left-[24px] top-[30px] lg:top-[50px] w-0.5 h-[calc(100%-0px)] ${
                        isCompleted
                          ? 'bg-alice-teal'
                          : 'bg-[#E5E5E5]'
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  {/* Step circle */}
                  <div
                    className={`z-10 text-[20px] w-[30px] h-[30px] lg:w-[50px] lg:h-[50px] flex items-center justify-center rounded-full border-2 font-bold transition-all
                      ${
                        isCompleted
                          ? 'bg-alice-teal text-white border-alice-teal'
                          : isCurrent
                            ? 'bg-white text-alice-teal border-alice-teal'
                            : 'bg-[#E9E9E9] text-alice-darkgray/25 border-[#E9E9E9]'
                      }
                    `}
                  >
                    {idx + 1}
                  </div>

                  {/* Step label */}
                  <span
                    className={`ml-[10px] font-semibold text-base
                      ${
                        isCompleted
                          ? 'text-alice-teal'
                          : isCurrent
                            ? 'text-alice-black'
                            : 'text-alice-black/50'
                      }`}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>
        {/* Main Wizard Content */}
        <section className="flex-1 bg-white rounded-2xl p-4 xl:p-6 border border-alice-gray">
          {/* Render step content here */}
          <div className="min-h-[200px] flex flex-col">
            {currentStep === 0 && <Step1ChildInfo />}
            {currentStep === 1 && <Step2GuidanceTopics />}
            {currentStep === 2 && <Step3CurrentConcerns />}
            {currentStep === 3 && <Step4ReviewSubmit />}
            {currentStep > 3 && (
            <div className="flex-1 flex items-center justify-center text-alice-darkgray text-lg">Step {currentStep + 1} content goes here.</div>
            )}
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 lg:mt-6 flex-col-reverse sm:flex-row gap-4 sm:gap-0">
            <button onClick={prevStep} disabled={currentStep === 0} className="px-6 py-[12px] lg:py-[17px] rounded-xl border border-alice-black text-alice-black hover:bg-alice-black hover:text-white font-semibold disabled:opacity-50 w-full sm:max-w-[100px] lg:max-w-[180px] transition-colors ease-in-out duration-300 disabled:pointer-events-none">Cancel</button>
            <button onClick={nextStep} disabled={currentStep === steps.length - 1} className="px-4 py-[13px] lg:py-[17px] rounded-xl bg-alice-teal hover:bg-teal-800 text-white font-semibold disabled:opacity-50 w-full sm:max-w-[260px] lg:max-w-[281px] transition-colors ease-in-out duration-300">Continue to Guidance Topics</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ChildBasicInformation; 
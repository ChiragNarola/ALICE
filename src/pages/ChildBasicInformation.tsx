import React, { useState, useRef, useEffect } from 'react';
import Step1ChildInfo from '../components/Step1ChildInfo';
import Step2GuidanceTopics from '../components/Step2GuidanceTopics';
import Step3CurrentConcerns from '../components/Step3CurrentConcerns';
import Step4ReviewSubmit from '../components/Step4ReviewSubmit';
import { submitStaffDetails } from '../api/api-services';
import type { StaffDetails } from '../routes/models/response/Auth'
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { toast } from 'react-toastify';

const steps = [
  'Child’s Basic Information',
  'Topics of Guidance',
  'Current Concerns',
  'Review & Submit',
];

interface StepRefHandle {
  validateAndSubmit: () => Promise<boolean>;
  getValues: () => any;
}


const ChildBasicInformation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMessageDropdown, setShowMessageDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [userDetails, setUserDetails] = useState<number>(0);

  const messageRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { setChatVisible } = useChatVisibility()
  setChatVisible(false);

  // const goToStep = (step: number) => setCurrentStep(step);
  // Add this to maintain form ref/trigger
  const stepRef = useRef<StepRefHandle>(null);

  const [formSubmit, setFormSubmit] = useState<any>({});

  const nextStep = async () => {
    const isValid = await stepRef.current?.validateAndSubmit();
    if (isValid) {
      const newData = stepRef.current?.getValues?.();
      if (newData) {
        // Merge new data into state
        setFormSubmit((prev: any) => {
          const finalData = { ...prev, ...newData };

          if (isSaveStep) {
            if (currentStep === 3) {
              const formData = new FormData();
              formData.append("age_group", finalData.age_group);
              formData.append("role_in_organisation", finalData.role_in_organisation);
              formData.append("qualification", finalData.qualification);

              submitStaffDetails(formData).then((response) => {
                if (response.IsSuccess) {
                  toast.success("Staff details submitted successfully");
                } else {
                  toast.error(response.Message);
                }
              });
            } else {
              handleSubmit();
            }
          }

          return finalData;
        });
      }

      if (!isSaveStep) {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting final form data:", formSubmit);

    try {
      const formData = new FormData();

      // Append fields from formSubmit (example fields, adjust as needed)
      if (formSubmit.age_group) {
        formData.append("age_group", formSubmit.age_group);
      }
      if (formSubmit.role_in_organisation) {
        formData.append("role_in_organisation", formSubmit.role_in_organisation);
      }
      if (formSubmit.qualification) {
        formData.append("qualification", formSubmit.qualification);
      }

      // Call API
      const response = await submitStaffDetails(formData);

      if (response.IsSuccess) {
        toast.success("Staff details submitted successfully");
      } else {
        toast.error(response.Message || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submit error:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const isSaveStep = (userDetails === 2 && currentStep === 2) || userDetails === 1 || userDetails == 3 && currentStep == 3;

  useEffect(() => {
    const user = localStorage.getItem("auth_user");

    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.roles) {
        console.log(parsedUser.roles)
        if (parsedUser.roles.length == 2) {
          setUserDetails(3); // has both the roles
        }
        else if (parsedUser.roles.length == 1 && parsedUser.roles[0] === 'parent') {
          setUserDetails(2); // has parent as roles
        }
        else if (parsedUser.roles.length == 1 && parsedUser.roles[0] === 'staff') {
          setUserDetails(1); // has staff as roles
          setCurrentStep(3)
        }
      }

    }
  }, []);
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
    <>
      <main className="flex flex-1 flex-col lg:flex-row px-4 sm:px-6 md:px-[30px] pt-4 sm:pt-6 md:pt-[30px] pb-4 sm:pb-6 gap-4 lg:gap-6">
        {/* Sidebar Wizard Navigation */}
        <aside className="lg:max-w-[320px] xl:max-w-[447px] w-full bg-white rounded-2xl border border-alice-gray p-4 lg:p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-[5px] text-alice-black">Child’s Profile</h2>
          <p className="text-sm text-alice-darkgray font-normal">Provide your child’s details to recieve personalized guidence and Support</p>
          <div className="border-t border-alice-gray my-4 md:my-6"></div>
          <ol className="relative">
            {steps.map((step, idx) => {
              // Step states
              if (userDetails == 1) {
                if (idx !== 3) return null;
              }
              if (userDetails == 2) {
                if (idx == 3) return null;
              }
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              // const isUpcoming = idx > currentStep; // Not needed, but for clarity

              return (
                <li key={step} className="flex items-center relative min-h-[30px] lg:min-h-[50px] mb-[24px] lg:mb-[50px] last:mb-0">
                  {/* Vertical line */}
                  {(((idx !== steps.length - 1 && userDetails !== idx)) && (userDetails !== 1)) && (
                    <span
                      className={`absolute left-[14px] lg:left-[24px] top-[30px] lg:top-[50px] w-0.5 h-[calc(100%-0px)] ${isCompleted
                        ? 'bg-alice-teal'
                        : 'bg-[#E5E5E5]'
                        }`}
                      aria-hidden="true"
                    />
                  )}

                  {/* Step circle */}
                  <div
                    className={`z-10 text-[20px] w-[30px] h-[30px] lg:w-[50px] lg:h-[50px] flex items-center justify-center rounded-full border-2 font-bold transition-all
                      ${isCompleted
                        ? 'bg-alice-teal text-white border-alice-teal'
                        : isCurrent || userDetails === 1
                          ? 'bg-white text-alice-teal border-alice-teal'
                          : 'bg-[#E9E9E9] text-alice-darkgray/25 border-[#E9E9E9]'
                      }
                    `}
                  >
                    {userDetails === 1 ? 1 : idx + 1}
                  </div>

                  {/* Step label */}
                  <span
                    className={`ml-[10px] font-semibold text-base
                      ${isCompleted
                        ? 'text-alice-teal'
                        : isCurrent || userDetails === 1
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
            {(currentStep === 0 && userDetails !== 1) && <Step1ChildInfo ref={stepRef} />}
            {(currentStep === 1 && userDetails !== 1) && <Step2GuidanceTopics ref={stepRef} />}
            {(currentStep === 2 && userDetails !== 1) && <Step3CurrentConcerns ref={stepRef} />}
            {(currentStep === 3 && userDetails !== 2) && <Step4ReviewSubmit ref={stepRef} />}
            {(currentStep > 3 && userDetails !== 2) && (
              <div className="flex-1 flex items-center justify-center text-alice-darkgray text-lg">Step {currentStep + 1} content goes here.</div>
            )}
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 lg:mt-6 flex-col-reverse sm:flex-row gap-4 sm:gap-0">
            <button onClick={prevStep} disabled={currentStep === 0 || userDetails === 1} className="px-6 py-[12px] lg:py-[17px] rounded-xl border border-alice-black text-alice-black hover:bg-alice-black hover:text-white font-semibold disabled:opacity-50 w-full sm:max-w-[100px] lg:max-w-[180px] transition-colors ease-in-out duration-300 disabled:pointer-events-none">Cancel</button>

            <button
              onClick={nextStep}
              // disabled={isSaveStep || isLastStep}
              className="px-4 py-[13px] lg:py-[17px] rounded-xl bg-alice-teal hover:bg-teal-800 text-white font-semibold disabled:opacity-50 w-full sm:max-w-[260px] lg:max-w-[281px] transition-colors ease-in-out duration-300"
            >
              {isSaveStep ? 'Save' : 'Continue to Guidance Topics'}
            </button>

          </div>
        </section>
      </main>
    </>

  );
};

export default ChildBasicInformation; 
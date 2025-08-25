import React, { useState, useRef, useEffect } from 'react';
import Step1ChildInfo from '../components/Step1ChildInfo';
import Step2GuidanceTopics from '../components/Step2GuidanceTopics';
import Step3CurrentConcerns from '../components/Step3CurrentConcerns';
import Step4ReviewSubmit from '../components/Step4ReviewSubmit';
import { submitStaffDetails, insertChildDetails, updateChildDetails, getChildDetailsForLoginUser, getStaffDetailsForLoginUser, updatestaffDetails } from '../api/api-services';
import { useChatVisibility } from "../contexts/ChatVisibilityContext";
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useChildren } from '../contexts/ChildrenContext';
import { useNavigate } from 'react-router-dom';

const steps = [
  'Child’s Basic Information',
  'Topics of Guidance',
  'Current Concerns',
  'Review & Submit',
];

interface StepRefHandle {
  validateAndSubmit: () => Promise<boolean>;
  getValues: () => any;
  setFormValues: (data: any) => void;
}

const ChildBasicInformation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMessageDropdown, setShowMessageDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [userDetails, setUserDetails] = useState<number>(0);
  const { user } = useAuth();
  const { addChilddata } = useChildren();
  const navigate = useNavigate();

  const messageRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { setChatVisible } = useChatVisibility()
  setChatVisible(false);

  // const goToStep = (step: number) => setCurrentStep(step);
  // Add this to maintain form ref/trigger
  const stepRef = useRef<StepRefHandle>(null);

  const [formSubmit, setFormSubmit] = useState<any>({});

  const nextStep = async () => {
    console.log("currentStep-----------------<>",currentStep)
    const isValid = await stepRef.current?.validateAndSubmit();
    if (isValid) {
      const newData = stepRef.current?.getValues?.();
      if (newData) {
        // Merge new data into state
        setFormSubmit((prev: any) => {
          const finalData = { ...prev, ...newData };
          return finalData;
        });
      }

      if (!isSaveStep) {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
  };

  const handleSubmit = async () => {
    const isValid = await stepRef.current?.validateAndSubmit();
    if (!isValid) return;

    const newData = stepRef.current?.getValues?.();
    const finalData = { ...formSubmit, ...newData };

    console.log("Submitting final form data:", finalData);

    try {
      if (!user) return;

      const isParent = user.roles?.includes("parent");
      const isStaff = user.roles?.includes("staff");

      const buildStaffForm = (): FormData => {
        const formData = new FormData();
        formData.append("age_group", finalData.age_group);
        formData.append("role_in_organisation", finalData.role_in_organisation);
        formData.append("qualification", finalData.qualification);
        return formData;
      };

      const successRoles: string[] = [];
      const failedRoles: string[] = [];

      // ----- Parent block -----
      if (isParent) {
        const newChildren: any[] = [];
        const updateChildren: any[] = [];

        for (const [index, child] of finalData.children.entries()) {
          if (child.id && child.id > 0) {
            updateChildren.push({
              id: child.id,
              name: [child.firstName, child.lastName].filter(Boolean).join(" "),
              date_of_birth: child.dob || "",
              gender: child.gender || "",
              things_to_keep_in_mind: child.thingsToKeepInMind || "",
              area_of_interest: finalData.topics[index] || [],
              concerns: finalData.concerns[index] || []
            });
          } else {
            newChildren.push({
              id: 0,
              name: [child.firstName, child.lastName].filter(Boolean).join(" "),
              date_of_birth: child.dob || "",
              gender: child.gender || "",
              things_to_keep_in_mind: child.thingsToKeepInMind || "",
              area_of_interest: finalData.topics[index] || [],
              concerns: finalData.concerns[index] || []
            });
          }
        }

        try {
          if (newChildren.length > 0) {
            const res = await insertChildDetails(newChildren);
            if (!res.IsSuccess) throw new Error(res.Message || "Insert failed");
          }
          if (updateChildren.length > 0) {
            const res = await updateChildDetails(updateChildren);
            if (!res.IsSuccess) throw new Error(res.Message || "Update failed");
          }
          successRoles.push("child");
        } catch (err) {
          console.error("Parent error:", err);
          failedRoles.push("child");
        }
      }

      // ----- Staff block -----
      if (isStaff) {
        try {
          const staffForm = buildStaffForm();
          const staffRes = user.isStaffDetailAdded
            ? await updatestaffDetails(staffForm)
            : await submitStaffDetails(staffForm);

          if (!staffRes.IsSuccess) throw new Error(staffRes.Message || "Staff failed");
          successRoles.push("staff");
        } catch (err) {
          console.error("Staff error:", err);
          failedRoles.push("staff");
        }
      }

      // ----- Final toast -----
      if (successRoles.length && !failedRoles.length) {
        toast.success(`Details submitted successfully.`);
        navigate("/chat");
      } else if (failedRoles.length && !successRoles.length) {
        toast.error(`Failed to submit ${failedRoles.join(", ")} details`);
        // toast.error(`Failed to submit details for [${failedRoles.join(", ")}]`);
      } else if (successRoles.length && failedRoles.length) {
        toast.info(
          `Some details succeeded: ${successRoles.join(", ")}, but failed for ${failedRoles.join(", ")}`
        );
      } else {
        toast.error("User has no matching roles");
      }
    } catch (error) {
      console.error("Form submit error:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const isSaveStep = (userDetails === 2 && currentStep === 2) || userDetails === 1 || userDetails == 3 && currentStep == 3;

  useEffect(() => {
    if (user) {
      const parsedUser = user;

      if (parsedUser.roles) {
        if (parsedUser.roles.length === 2) {
          setUserDetails(3); // has both the roles
        }
        else if (
          parsedUser.roles.length === 1 &&
          parsedUser.roles[0] === "parent"
        ) {
          setUserDetails(2); // parent role
        }
        else if (
          parsedUser.roles.length === 1 &&
          parsedUser.roles[0] === "staff"
        ) {
          setUserDetails(1); // staff role
          setCurrentStep(3);
        }
      }
    }
  }, []);


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!user) return;
        const isParent = user.roles?.includes("parent");
        const isStaff = user.roles?.includes("staff");

        const mapChildDetails = (children: any[]) =>
          children
            .filter(child => !child.is_deleted)
            .map(child => {
              const nameParts = (child.name || "").trim().split(" ");

              const childData = {
                id: child.id,
                firstName: nameParts[0] || "",
                // middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : nameParts[1] || "",
                lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
                gender: child.gender as "Boy" | "Girl" | "Prefer not to say",
                dob: child.date_of_birth,
                topics: (child.area_of_interest || []).map((a: any) => a.id),
                concerns: (child.concerns || []).map((a: any) => a.id),
              };

              addChilddata(childData);
              return childData;
            });


        if (isParent) {
          const response = await getChildDetailsForLoginUser();
          if (response.IsSuccess && Array.isArray(response.Data)) {
            const apiChildren = mapChildDetails(response.Data);
            // console.log(apiChildren);
            stepRef.current?.setFormValues({ children: apiChildren });
          }
          //  else {
          //   stepRef.current?.setFormValues({
          //     children: [
          //       {
          //         firstName: '',
          //         middleName: '',
          //         lastName: '',
          //         gender: 'Boy',
          //         dob: '',
          //         topics: [],
          //         concerns: [],
          //       }
          //     ]
          //   });
          // }
        }

        if (isStaff) {
          const staff_response = await getStaffDetailsForLoginUser();
          if (staff_response.IsSuccess) {
            stepRef.current?.setFormValues({
              role_in_organisation: staff_response.Data.role_in_organisation || "",
              qualification: staff_response.Data.qualification || "",
              age_group: staff_response.Data.age_group || "1-5",
            });
          }
        }

      } catch (error) {
        console.error("Error fetching child/staff details:", error);
      }
    };

    fetchUserDetails();
  }, [currentStep, user]);

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
              onClick={isSaveStep ? handleSubmit : nextStep}
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
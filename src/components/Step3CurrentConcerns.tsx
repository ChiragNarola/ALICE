import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import concerns_img from '../assets/images/concerns-icon.svg';
import { useChildren } from '../contexts/ChildrenContext';
import { area_of_concerns } from '../api/api-services';
import type { ConcernDTO } from '../routes/models/response/Response';

export interface StepRefType {
  validateAndSubmit: () => Promise<boolean>;
  getValues: () => any;
}

const Step3CurrentConcerns = forwardRef<StepRefType>((_, ref) => {
  const { children, updateChild, deleteChild } = useChildren();
  const [errors, setErrors] = useState<boolean[]>([]); // array of booleans for each child
  const [CONCERNS, setCONCERNS] = useState<ConcernDTO[]>([]);

  const validateAndSubmit = async (): Promise<boolean> => {
    const newErrors = children.map((child) => !child.concerns || child.concerns.length === 0);
    setErrors(newErrors);
    return !newErrors.includes(true);
  };

  useImperativeHandle(ref, () => ({
    validateAndSubmit,
    getValues: () => ({
      concerns: children.map((child) => child.concerns || []),
    }),
  }));

  //Dynamic Area Of Concern 
  useEffect(() => {
    const areaOfConcerns = async () => {
      const concernList = await area_of_concerns();
      if (concernList.IsSuccess) {
        setCONCERNS(concernList.Data);
      }
    };
    areaOfConcerns();
  }, []);

  const handleConcernToggle = (idx: number, concern: number) => {
    const currentConcerns = children[idx].concerns || [];
    const newConcerns = currentConcerns.includes(concern)
      ? currentConcerns.filter((c) => c !== concern)
      : [...currentConcerns, concern];

    updateChild(idx, { concerns: newConcerns });

    // clear error on interaction
    setErrors((prev) => {
      const copy = [...prev];
      copy[idx] = false;
      return copy;
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-top sm:justify-between gap-4">
        <div className="flex gap-3 items-center justify-center">
          <div className="bg-alice-teal/10 min-w-[50px] min-h-[50px] sm:min-w-[54px] sm:min-h-[54px] lg:min-w-[60px] lg:min-h-[60px] rounded-full flex items-center justify-center">
            <img src={concerns_img} alt="concerns icon" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-alice-black mb-[5px]">Current Concerns</h2>
            <p className="text-sm text-alice-darkgray font-normal">Select areas you'd like guidance or support for</p>
          </div>
        </div>
      </div>

      <hr className="my-4 md:my-6 border-alice-gray" />

      {children.map((child, idx) => {
        const hasError = errors[idx];

        return (
          <div
            key={idx}
            className={`mb-4 lg:mb-6 border rounded-xl p-4 lg:p-6 relative bg-white w-full ${hasError ? 'border-red-500' : 'border-alice-gray'
              }`}
          >
            <div className="absolute top-4 right-4">
              {idx !== 0 && <button
                type="button"
                onClick={() => deleteChild(idx)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#F00044] text-white font-semibold flex items-center gap-1 px-3 py-1.5 sm:px-[10px] sm:py-[5px] rounded-md hover:bg-[#e6002e] transition-colors text-sm"
              >
                <svg width="18" height="18" className="me-[6px]" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.75 3.75H2.25C2.05109 3.75 1.86032 3.82902 1.71967 3.96967C1.57902 4.11032 1.5 4.30109 1.5 4.5C1.5 4.69891 1.57902 4.88968 1.71967 5.03033C1.86032 5.17098 2.05109 5.25 2.25 5.25H3.75V14.25C3.75018 14.8467 3.98729 15.4189 4.40921 15.8408C4.83113 16.2627 5.40332 16.4998 6 16.5H12C12.5967 16.4998 13.1689 16.2627 13.5908 15.8408C14.0127 15.4189 14.2498 14.8467 14.25 14.25V5.25H15.75C15.9489 5.25 16.1397 5.17098 16.2803 5.03033C16.421 4.88968 16.5 4.69891 16.5 4.5C16.5 4.30109 16.421 4.11032 16.2803 3.96967C16.1397 3.82902 15.9489 3.75 15.75 3.75ZM8.25 12C8.25 12.1989 8.17098 12.3897 8.03033 12.5303C7.88968 12.671 7.69891 12.75 7.5 12.75C7.30109 12.75 7.11032 12.671 6.96967 12.5303C6.82902 12.3897 6.75 12.1989 6.75 12V8.25C6.75 8.05109 6.82902 7.86032 6.96967 7.71967C7.11032 7.57902 7.30109 7.5 7.5 7.5C7.69891 7.5 7.88968 7.57902 8.03033 7.71967C8.17098 7.86032 8.25 8.05109 8.25 8.25V12ZM11.25 12C11.25 12.1989 11.171 12.3897 11.0303 12.5303C10.8897 12.671 10.6989 12.75 10.5 12.75C10.3011 12.75 10.1103 12.671 9.96967 12.5303C9.82902 12.3897 9.75 12.1989 9.75 12V8.25C9.75 8.05109 9.82902 7.86032 9.96967 7.71967C10.1103 7.57902 10.3011 7.5 10.5 7.5C10.6989 7.5 10.8897 7.57902 11.0303 7.71967C11.171 7.86032 11.25 8.05109 11.25 8.25V12Z" fill="white" />
                  <path d="M7.5 3H10.5C10.6989 3 10.8897 2.92098 11.0303 2.78033C11.171 2.63968 11.25 2.44891 11.25 2.25C11.25 2.05109 11.171 1.86032 11.0303 1.71967C10.8897 1.57902 10.6989 1.5 10.5 1.5H7.5C7.30109 1.5 7.11032 1.57902 6.96967 1.71967C6.82902 1.86032 6.75 2.05109 6.75 2.25C6.75 2.44891 6.82902 2.63968 6.96967 2.78033C7.11032 2.92098 7.30109 3 7.5 3Z" fill="white" />
                </svg>
                <span className="hidden sm:inline-block">Delete</span>
              </button>}
            </div>

            <div className="mb-3 font-bold text-base sm:text-lg lg:text-xl">
              {idx + 1}
              {idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Child Information
            </div>

            <div className="mb-2 font-semibold">Concerns</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6">
              {CONCERNS.map((concern) => {
                const checked = child.concerns?.includes(concern.id);
                return (
                  <label
                    key={concern.id}
                    className={`flex items-center px-3 xl:px-5 py-[14px] lg:py-[18px] rounded-xl border transition-all cursor-pointer select-none text-[15px] md:text-base font-normal ${checked
                      ? 'bg-alice-teal text-white border-alice-teal'
                      : 'bg-white text-alice-darkgray border-[#E5E5E5] hover:border-alice-teal'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleConcernToggle(idx, concern.id)}
                      className="mr-[10px] w-[22px] h-[22px] rounded accent-white border border-[#E5E5E5] focus:ring-0"
                    />
                    {concern.concern}
                  </label>
                );
              })}
            </div>

            {hasError ? (
              <p className="text-red-500 text-sm mt-2">Please select at least one concern for this child.</p>
            ) : (
              <p className="text-white text-sm mt-2">.</p>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Step3CurrentConcerns;

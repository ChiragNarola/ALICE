import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import topic_img from '../assets/images/topic-icon.svg';
import { useChildren } from '../contexts/ChildrenContext';
import { area_of_interests } from '../api/api-services';
import type { AreaOfInterestDTO } from '../routes/models/response/Response';

export interface StepRefType {
  validateAndSubmit: () => Promise<boolean>;
  getValues: () => any;
}

const Step2GuidanceTopics = forwardRef<StepRefType>((_, ref) => {
  const { children, updateChild } = useChildren();
  const [errors, setErrors] = useState<boolean[]>([]);
  const [TOPICS, setTOPICS] = useState<AreaOfInterestDTO[]>([]);

  // Validation Function
  const validateAndSubmit = async (): Promise<boolean> => {
    const newErrors = children.map((child) => {
      const hasNoTopicSelected = !child.topics || child.topics.length === 0;
      const isOtherSelected = child.topics.includes(-1);
      const isOtherInvalid = isOtherSelected && !child.otherTopicText?.trim();

      return hasNoTopicSelected || isOtherInvalid;
    });

    setErrors(newErrors);
    return !newErrors.includes(true);
  };

  // Dynamic Area Of interest
  useEffect(() => {
    const fetchAreaOfInterests = async () => {
      const interestList = await area_of_interests();
      if (interestList.IsSuccess) {
        setTOPICS(interestList.Data);
      }
    };
    fetchAreaOfInterests();
  }, []);

  useImperativeHandle(ref, () => ({
    validateAndSubmit,
 getValues: () => {
  return children.map((child) => {
    const isOtherSelected = child.topics.includes(-1);

    return isOtherSelected
      ? [...child.topics.filter((t) => t !== -1), child.otherTopicText?.trim() || '']
      : child.topics;
  });
},

  }));

  const handleTopicToggle = (idx: number, topic: number) => {
    const currentTopics = children[idx].topics || [];

    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter((t) => t !== topic)
      : [...currentTopics, topic];

    updateChild(idx, { topics: newTopics });

    // clear error on interaction
    setErrors((prev) => {
      const copy = [...prev];
      copy[idx] = false;
      return copy;
    });
  };

  const handleOtherTextChange = (idx: number, value: string) => {
    updateChild(idx, { otherTopicText: value });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-top sm:justify-between gap-4">
        <div className="flex gap-3 items-center justify-center">
          <div className="bg-alice-teal/10 min-w-[50px] min-h-[50px] sm:min-w-[54px] sm:min-h-[54px] lg:min-w-[60px] lg:min-h-[60px] rounded-full flex items-center justify-center">
            <img src={topic_img} alt="child icon" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-alice-black mb-[5px]">
              Topics of Guidance
            </h2>
            <p className="text-sm text-alice-darkgray font-normal">
              Select all areas where you’d like personalized support
            </p>
          </div>
        </div>
      </div>
      <hr className="my-4 md:my-6 border-alice-gray" />

      {children.map((child, idx) => {
        const hasError = errors[idx];
        const isOtherSelected = child.topics.includes(-1); // -1 will represent "Other"

        return (
          <div
            key={idx}
            className={`mb-4 lg:mb-6 border rounded-xl p-4 lg:p-6 relative bg-white w-full ${
              hasError ? 'border-red-500' : 'border-alice-gray'
            }`}
          >
            <div className="mb-3 font-bold text-base sm:text-lg lg:text-xl">
              {idx + 1}
              {idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Child Information
            </div>

            <div className="mb-2 font-semibold">Topics</div>

            <div
              className={`${
                TOPICS.length === 0
                  ? 'flex items-center justify-center'
                  : 'grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6'
              }`}
            >
              {TOPICS.length === 0 ? (
                // Loader while waiting for topics
                <div className="flex justify-center items-center py-6">
                  <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Existing topics */}
                  {TOPICS.map((topic) => {
                    const checked = child.topics.includes(topic.id);
                    return (
                      <label
                        key={topic.id}
                        className={`flex items-center px-3 xl:px-5 py-[14px] lg:py-[18px] rounded-xl border transition-all cursor-pointer select-none text-[15px] md:text-base font-normal ${
                          checked
                            ? 'bg-alice-teal text-white border-alice-teal'
                            : 'bg-white text-alice-darkgray border-[#E5E5E5] hover:border-alice-teal'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTopicToggle(idx, topic.id)}
                          className="mr-[10px] w-[22px] h-[22px] rounded accent-white border border-[#E5E5E5] focus:ring-0"
                        />
                        {topic.interest}
                      </label>
                    );
                  })}

                  {/* "Other" option */}
                  <label
                    className={`flex items-center px-3 xl:px-5 py-[14px] lg:py-[18px] rounded-xl border transition-all cursor-pointer select-none text-[15px] md:text-base font-normal ${
                      isOtherSelected
                        ? 'bg-alice-teal text-white border-alice-teal'
                        : 'bg-white text-alice-darkgray border-[#E5E5E5] hover:border-alice-teal'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isOtherSelected}
                      onChange={() => handleTopicToggle(idx, -1)} // -1 represents "Other"
                      className="mr-[10px] w-[22px] h-[22px] rounded accent-white border border-[#E5E5E5] focus:ring-0"
                    />
                    Other
                  </label>
                </>
              )}
            </div>

            {/* Full-width textbox when "Other" is selected */}
            {isOtherSelected && (
              <div className="mt-4">
                <input
                  type="text"
                  value={child.otherTopicText || ''}
                  onChange={(e) => handleOtherTextChange(idx, e.target.value)}
                  placeholder="Things to keep in mind"
                  className="w-full px-4 py-3 border border-alice-gray rounded-xl focus:outline-none focus:border-alice-teal text-base"
                />
              </div>
            )}

            {hasError ? (
              <p className="text-red-500 text-sm mt-2">
                {isOtherSelected && !child.otherTopicText?.trim()
                  ? 'Please specify the topic for "Other".'
                  : 'Please select at least one topic for this child.'}
              </p>
            ) : (
              <p className="text-white text-sm mt-2">.</p>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Step2GuidanceTopics;

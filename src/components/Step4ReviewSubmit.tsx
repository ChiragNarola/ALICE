import React, { useState } from "react";
import MultiRangeSlider from "multi-range-slider-react";
// import "multi-range-slider-react/dist/style.css"; // Import the default styles

// const MIN_AGE = 0;
// const MAX_AGE = 100;

const Step4ReviewSubmit: React.FC = () => {
  const [comments, setComments] = useState("");
  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(80);

  // const getPercent = (value: number) =>
  //   Math.round(((value - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100);

  // const minPercent = getPercent(minAge);
  // const maxPercent = getPercent(maxAge);

  return (
    <div className="flex flex-col gap-8">
      {/* Text Input */}
      <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Job title</span>
        </label>
        <input
          type="text"
          value={comments}
          onChange={e => setComments(e.target.value)}
          placeholder="Enter any comments here..."
          className="w-full px-5 py-[14px] lg:py-[18px] border border-alice-gray rounded-[12px] focus:outline-none focus:border-alice-teal mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal"
        />
      </div>
      {/* MultiRangeSlider from the package */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2 text-alice-black">
          Child Age Selected
        </label>
        <MultiRangeSlider
          min={0}
          max={15}
          step={1}
          minValue={minAge}
          maxValue={maxAge}
          onInput={(e) => {
            setMinAge(e.minValue);
            setMaxAge(e.maxValue);
          }}
          ruler={false}
          label={true}
          style={{
            border: "none",
            boxShadow: "none",
            padding: "15px 8px",
          }}
          barInnerColor="#008080"
          thumbLeftColor="#008080"
          thumbRightColor="#008080"
        />
        <div className="flex justify-between text-sm text-alice-darkgray mt-2">
          <span>Min: {minAge}</span>
          <span>Max: {maxAge}</span>
        </div>
      </div>
    </div>
  );
};

export default Step4ReviewSubmit;
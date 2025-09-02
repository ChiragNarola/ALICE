import { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiRangeSlider from "multi-range-slider-react"; // make sure you have this installed

// Zod schema
const reviewSchema = z.object({
  role_in_organisation: z.string().min(1, "Role in organisation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  age_group: z
    .string()
    .regex(/^\d+\-\d+$/, "Age group must be in format min-max"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const Step4ReviewSubmit = forwardRef<
  { validateAndSubmit: () => Promise<boolean>; getValues: () => ReviewFormValues; setFormValues: (data: ReviewFormValues) => void; },
  {}
>((_, ref) => {
  const {
    control,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      role_in_organisation: "",
      qualification: "",
      age_group: "1-5",
    },
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
  });



  useImperativeHandle(ref, () => ({
    validateAndSubmit: async () => {
      const isValid = await trigger();
      if (isValid) {
        // const values = getValues();
        //console.log("Step 4 Values:", values);
      }
      return isValid;
    },
    getValues: () => getValues(),
    setFormValues: (data) => {
      console.log("Step4 setFormValues received:", data);
      reset(data);
    },
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Job Title Field */}
      <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">
            Job Title <span className="text-red-500">*</span>
          </span>
        </label>
        <Controller
          name="role_in_organisation"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter your role..."
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${errors.role_in_organisation
                ? "border-red-500"
                : "border-alice-gray"
                }`}
            />
          )}
        />
        {errors.role_in_organisation && (
          <p className="text-red-500 text-sm mt-1">
            {errors.role_in_organisation.message}
          </p>
        )}
      </div>

      {/* Qualification Field */}
      <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">
            Qualification <span className="text-red-500">*</span>
          </span>
        </label>
        <Controller
          name="qualification"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter your qualification..."
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${errors.qualification
                ? "border-red-500"
                : "border-alice-gray"
                }`}
            />
          )}
        />
        {errors.qualification && (
          <p className="text-red-500 text-sm mt-1">
            {errors.qualification.message}
          </p>
        )}
      </div>

      {/* Age Range Slider */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2 text-alice-black">
          Child Age Selected
        </label>
        <Controller
          name="age_group"
          control={control}
          render={({ field: { value, onChange } }) => {
            // Always derive from RHF value
            const [min, max] = value.split("-").map(Number);

            return (
              <>
                <MultiRangeSlider
                  key={value} 
                  min={0}
                  max={10}
                  step={1}
                  minValue={min}
                  maxValue={max}
                  onInput={(e) => {
                    onChange(`${e.minValue}-${e.maxValue}`);
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
                  <span>Min: {min}</span>
                  <span>Max: {max}</span>
                </div>
                {errors.age_group && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.age_group.message}
                  </p>
                )}
              </>
            );
          }}
        />

      </div>
    </div>
  );
});

export default Step4ReviewSubmit;

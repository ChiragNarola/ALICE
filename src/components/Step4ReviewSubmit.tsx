import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import MultiRangeSlider from 'multi-range-slider-react';

const reviewSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  minAge: z.number().min(0, 'Minimum age is required'),
  maxAge: z.number().min(1, 'Maximum age is required')
}).refine((data) => data.maxAge > data.minAge, {
  message: 'Maximum age must be greater than minimum age',
  path: ['maxAge'],
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const Step4ReviewSubmit = forwardRef<{ validateAndSubmit: () => Promise<boolean>;getValues: () => ReviewFormValues }, {}>((_, ref) => {
  const {
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      jobTitle: '',
      qualification: '',
      minAge: 1,
      maxAge: 5,
    },
    resolver: zodResolver(reviewSchema),
    mode: 'onChange',
  });

useImperativeHandle(ref, () => ({
  validateAndSubmit: async () => {
    const isValid = await trigger();
    if (isValid) {
      const values = getValues();
    }
    return isValid;
  },
  getValues: () => getValues(),
}));


  return (
    <div className="flex flex-col gap-8">
      {/* Job Title Field */}
      <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Job Title <span className="text-red-500">*</span></span>
        </label>
        <Controller
          name="jobTitle"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter job title..."
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${
                errors.jobTitle ? 'border-red-500' : 'border-alice-gray'
              }`}
            />
          )}
        />
        {errors.jobTitle && (
          <p className="text-red-500 text-sm mt-1">{errors.jobTitle.message}</p>
        )}
      </div>
      
           <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Qualification <span className="text-red-500">*</span></span>
        </label>
        <Controller
          name="qualification"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter job title..."
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${
                errors.qualification ? 'border-red-500' : 'border-alice-gray'
              }`}
            />
          )}
        />
        {errors.qualification && (
          <p className="text-red-500 text-sm mt-1">{errors.qualification.message}</p>
        )}
      </div>

      {/* Age Range Slider */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2 text-alice-black">
          Child Age Selected
        </label>
        <Controller
          name="minAge"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Controller
              name="maxAge"
              control={control}
              render={({ field: { value: maxValue, onChange: onMaxChange } }) => (
                <>
                  <MultiRangeSlider
                    min={0}
                    max={10}
                    step={1}
                    minValue={value}
                    maxValue={maxValue}
                    onInput={(e) => {
                      onChange(e.minValue);
                      onMaxChange(e.maxValue);
                    }}
                    ruler={false}
                    label={true}
                    style={{ border: 'none', boxShadow: 'none', padding: '15px 8px' }}
                    barInnerColor="#008080"
                    thumbLeftColor="#008080"
                    thumbRightColor="#008080"
                  />
                  <div className="flex justify-between text-sm text-alice-darkgray mt-2">
                    <span>Min: {value}</span>
                    <span>Max: {maxValue}</span>
                  </div>
                  {(errors.minAge || errors.maxAge) && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxAge?.message || errors.minAge?.message}
                    </p>
                  )}
                </>
              )}
            />
          )}
        />
      </div>
    </div>
  );
});

export default Step4ReviewSubmit;

import { forwardRef, useImperativeHandle, useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiRangeSlider from "multi-range-slider-react";
import { staffJobRole } from "../api/api-services";

const reviewSchema = z
  .object({
    role_in_organisation: z.string().nonempty("Job title is required"),
    qualification: z.string().optional(),
    age_group: z
      .string()
      .regex(/^\d+\-\d+$/, "Age group must be in format min-max"),
    other_role: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role_in_organisation === "Other") {
        return !!data.other_role && data.other_role.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please specify the job title",
      path: ["other_role"],
    }
  );

type ReviewFormValues = z.infer<typeof reviewSchema>;

const Step4ReviewSubmit = forwardRef<
  {
    validateAndSubmit: () => Promise<boolean>;
    getValues: () => ReviewFormValues;
    setFormValues: (data: ReviewFormValues) => void;
  },
  {}
>((_, ref) => {
  const {
    control,
    getValues,
    trigger,
    reset,
    watch,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      role_in_organisation: "Manager",
      other_role: "",
      qualification: "",
      age_group: "1-5",
    },
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
  });

  const [jobTitle, setJobTitle] = useState<string[]>([]);
  const [pendingData, setPendingData] = useState<ReviewFormValues | null>(null);
  const selectedRole = watch("role_in_organisation");
  const prevRoleRef = useRef<string>("");

  useEffect(() => {
    const jobList = async () => {
      try {
        const jobs = await staffJobRole();
        if (jobs?.IsSuccess && Array.isArray(jobs.Data)) {
          setJobTitle(jobs.Data as unknown as [] );
        } else {
          console.error("Invalid job data received:", jobs);
        }
      } catch (error) {
        console.error("Error fetching job titles:", error);
      }
    };
    jobList();
  }, []);

  useEffect(() => {
    if (prevRoleRef.current === "Other" && selectedRole !== "Other") {
      setValue("other_role", "");
      clearErrors("other_role");
    }
    prevRoleRef.current = selectedRole;
  }, [selectedRole, setValue, clearErrors]);

  useEffect(() => {
    if (jobTitle.length && pendingData) {
      const incomingRole = pendingData.role_in_organisation || "";
      let finalRole = incomingRole;
      let finalOtherRole = "";

      if (incomingRole && !jobTitle.includes(incomingRole)) {
        finalRole = "Other";
        finalOtherRole = incomingRole.trim();
      }

      reset({
        role_in_organisation: finalRole,
        other_role: finalOtherRole,
        qualification: pendingData.qualification || "",
        age_group: pendingData.age_group || "1-5",
      });

      setPendingData(null);
    }
  }, [jobTitle, pendingData, reset]);

  useImperativeHandle(ref, () => ({
    validateAndSubmit: async () => {
      const isValid = await trigger();
      if (!isValid) return false;

      const values = getValues();
      const finalPayload = {
        ...values,
        role_in_organisation:
          values.role_in_organisation === "Other"
            ? values.other_role?.trim() || ""
            : values.role_in_organisation,
      };
      delete finalPayload.other_role;

      return true;
    },

    getValues: () => getValues(),

    setFormValues: (data) => {
      setPendingData(data);
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
            <select
              {...field}
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] text-[14px] lg:text-base font-normal focus:outline-none ${
                errors.role_in_organisation ? "border-red-500" : "border-alice-gray"
              } ${field.value === "" ? "text-alice-darkgray" : "text-alice-black"}`}
            >
              {jobTitle.map((title, index) => (
                <option key={index} value={title}>
                  {title}
                </option>
              ))}
            </select>
          )}
        />
        {errors.role_in_organisation && (
          <p className="text-red-500 text-sm mt-1">{errors.role_in_organisation.message}</p>
        )}

        {selectedRole === "Other" && (
          <Controller
            name="other_role"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Enter custom job title"
                className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-3 bg-white text-alice-black text-[14px] lg:text-base font-normal focus:outline-none ${
                  errors.other_role ? "border-red-500" : "border-alice-gray"
                }`}
              />
            )}
          />
        )}
        {errors.other_role && (
          <p className="text-red-500 text-sm mt-1">{errors.other_role.message}</p>
        )}
      </div>

      {/* Qualification Field */}
      <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">Qualification</span>
        </label>
        <Controller
          name="qualification"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter your qualification..."
              className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${
                errors.qualification ? "border-red-500" : "border-alice-gray"
              }`}
            />
          )}
        />
      </div>

      {/* Age Range Slider */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2 text-alice-black">
          Age Group You Work With
        </label>
        <Controller
          name="age_group"
          control={control}
          render={({ field: { value, onChange } }) => {
            const [min, max] = value.split("-").map(Number);
            return (
              <>
                <MultiRangeSlider
                  key={value}
                  min={0}
                  max={5}
                  step={1}
                  minValue={min}
                  maxValue={max}
                  onInput={(e) => onChange(`${e.minValue}-${e.maxValue}`)}
                  ruler={false}
                  label={true}
                  style={{ border: "none", boxShadow: "none", padding: "15px 8px" }}
                  barInnerColor="#008080"
                  thumbLeftColor="#008080"
                  thumbRightColor="#008080"
                />
                <div className="flex justify-between text-sm text-alice-darkgray mt-2">
                  <span>Min: {min}</span>
                  <span>Max: {max}</span>
                </div>
                {errors.age_group && (
                  <p className="text-red-500 text-sm mt-1">{errors.age_group.message}</p>
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

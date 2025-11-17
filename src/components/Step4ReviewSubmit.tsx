import { forwardRef, useImperativeHandle, useEffect, useState, useRef,Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiRangeSlider from "multi-range-slider-react";
import { staffJobRole,getNursery } from "../api/api-services";
import type { NurseryItem } from "../routes/models/response/Response";

const reviewSchema = z
  .object({
    role_in_organisation: z.string().nonempty("Job title is required"),
    qualification: z.string().optional(),
    age_group: z
      .string()
      .regex(/^\d+\-\d+$/, "Age group must be in format min-max"),
    other_role: z.string().optional(),
    nursery: z.array(z.number().min(1)).min(1, "At least one nursery must be selected")
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
      nursery: [] as number[],
      age_group: "1-5",
    },
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
  });

  const [jobTitle, setJobTitle] = useState<string[]>([]);
  const [pendingData, setPendingData] = useState<ReviewFormValues | null>(null);
  const selectedRole = watch("role_in_organisation");
  const prevRoleRef = useRef<string>("");
  const [nurseryList, setNurseryList] = useState<NurseryItem[]>([]);

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
    if (jobTitle.length && nurseryList.length && pendingData) {
      const incomingRole = pendingData.role_in_organisation || "";
      let finalRole = incomingRole;
      let finalOtherRole = "";

      if (incomingRole && !jobTitle.includes(incomingRole)) {
        finalRole = "Other";
        finalOtherRole = incomingRole.trim();
      }

      const normalizeNursery = (val: any): number[] => {
        if (Array.isArray(val)) return val.map(Number);
        if (typeof val === "string") return val.split(",").map(s => Number(s.trim()));
        if (typeof val === "number") return [val];
        return [];
      };

      reset({
        role_in_organisation: finalRole,
        other_role: finalOtherRole,
        qualification: pendingData.qualification || "",
        age_group: pendingData.age_group || "1-5",
        nursery: normalizeNursery(pendingData.nursery),
      });

      setPendingData(null);
    }
  }, [jobTitle, nurseryList, pendingData, reset]);


  useImperativeHandle(ref, () => ({
    validateAndSubmit: async () => {
      const isValid = await trigger();
      if (!isValid) return false;

      const values = getValues();
      console.log("values are",values.nursery);

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

  useEffect(() => {
      const loadNurseries = async () => {
        try {
          const res = await getNursery();
          if (res.IsSuccess && Array.isArray(res.Data)) {
            // Map API response to objects with id + nursery_name
            const nurseries = res.Data.map((n: any) => ({
              id: Number(n.id),
              name: n.nursery_name,
            }));
            setNurseryList(nurseries);
          }
        } catch (err) {
          console.error("Error fetching nurseries:", err);
        }
      };

      loadNurseries();
    }, []);



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
    <div className="w-full">
      <Listbox value={field.value} onChange={field.onChange}>
        {({ open }) => (
          <div className="relative">
            {/* Selected Value */}
            <Listbox.Button
              className={`relative w-full px-4 py-3 lg:py-4 text-left border rounded-[12px] text-[14px] sm:text-base lg:text-lg font-normal cursor-pointer focus:outline-none transition-all duration-300 ease-in-out
                ${
                  errors.role_in_organisation
                    ? "border-red-500"
                    : "border-alice-gray"
                }
                ${
                  !field.value ? "text-alice-darkgray" : "text-alice-black"
                }`}
            >
              <span className="block truncate">
                {field.value || "Select a job title"}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="w-5 h-5 text-alice-darkgray" />
              </span>
            </Listbox.Button>

            {/* Dropdown Options */}
            <Transition
              as={Fragment}
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg focus:outline-none"
              >
                {jobTitle.map((title, index) => (
                  <Listbox.Option
                    key={index}
                    value={title}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 px-4 text-sm sm:text-base ${
                        active
                          ? "bg-alice-teal text-white"
                          : "text-gray-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {title}
                        </span>
                        {selected && (
                          <CheckIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
      {errors.role_in_organisation && (
        <p className="text-red-500 text-sm mt-1">
          {errors.role_in_organisation.message}
        </p>
      )}
    </div>
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

      {/* select nursery */}
      <div>
        <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
          <span className="bg-[#FEFCF8] px-[5px]">
            Nursery Name <span className="text-red-500"></span>
          </span>
        </label>

   <Controller
  name="nursery"
  control={control}
  render={({ field }) => (
    <div className="w-full">
      <Listbox value={(field.value || []).map(Number)} onChange={(val: number[]) => field.onChange(val)} multiple>
        {({ open }) => (
          <div className="relative">
            {/* Selected Value */}
            <Listbox.Button
              className={`relative w-full px-4 py-3 lg:py-4 text-left border rounded-[12px] text-[14px] sm:text-base lg:text-lg font-normal cursor-pointer focus:outline-none transition-all duration-300 ease-in-out
                ${
                  errors.nursery
                    ? "border-red-500"
                    : "border-alice-gray"
                }
                ${
                  !field.value ? "text-alice-darkgray" : "text-alice-black"
                }`}
            >
              <span className="block truncate">
                {field.value && field.value.length > 0
                  ? nurseryList
                      .filter(n => field.value.includes(n.id))
                      .map(n => n.name)
                      .join(", ")
                  : "Select nursery"}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="w-5 h-5 text-alice-darkgray" />
              </span>
            </Listbox.Button>

            {/* Dropdown Options */}
            <Transition
              as={Fragment}
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg focus:outline-none"
              >
                {nurseryList.map((nur) => (
                  <Listbox.Option
                    key={nur.id}
                    value={nur.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 px-4 text-sm sm:text-base ${
                        active
                          ? "bg-alice-teal text-white"
                          : "text-gray-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {nur.name}
                        </span>
                        {selected && (
                          <CheckIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
      {errors.nursery && (
        <p className="text-red-500 text-sm mt-1">
          {errors.nursery.message}
        </p>
      )}
    </div>
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

import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChildren } from '../contexts/ChildrenContext';
import child_img from '../assets/images/child-img.svg';
import { deleteChildApi } from '../api/api-services';
import { toast } from 'react-toastify';

const childSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().min(1, "Middle name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(['Boy', 'Girl', 'Prefer not to say']),
  dob: z.string().min(1, "Date of Birth is required"),
  topics: z.array(z.number()).optional(),
  concerns: z.array(z.number()).optional(),
});

const formSchema = z.object({
  children: z.array(childSchema).min(1, "At least one child is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Step1ChildInfo = forwardRef<{ validateAndSubmit: () => Promise<boolean>; setFormValues: (data: FormValues) => void; }, {}>((_, ref) => {
  const { children, updateChild, addChild, deleteChild } = useChildren();

  const {
    control,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { children },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children',
  });

  useImperativeHandle(ref, () => ({
    validateAndSubmit: () => {
      return trigger().then((isValid) => {
        if (isValid) {
          const formValues = getValues();
          formValues.children.forEach((child, idx) => {
            updateChild(idx, child);
          });
        }
        return isValid;
      });
    },
    getValues: () => {
      return getValues();
    },
    setFormValues: (data: FormValues) => {
      reset(data);
    },
  }));

  function handleDelete(idx: number, child_id: number | undefined) {
    if (window.confirm("Are you sure you want to delete this child?")) {
      if (child_id) {
        deleteChildApi(child_id).then((result) => {
          if (result?.IsSuccess) {
            toast.success("Child deleted successfully");
            remove(idx);
            deleteChild(idx);
          } else {
            toast.error(result.Message);
            console.error("Failed to delete child", result);
          }
        }).catch((error) => {
          console.error("Error deleting child:", error);
        });
      } else {
        remove(idx);
        deleteChild(idx);
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-alice-teal/10 p-2 rounded-full">
            <img src={child_img} alt="child icon" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-alice-black">Child’s Basic Information</h2>
            <p className="text-sm text-alice-darkgray">Tell us about your child</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            append({
              id: 0,
              firstName: '',
              middleName: '',
              lastName: '',
              gender: 'Boy',
              dob: '',
              topics: [],
              concerns: [],
            });
            addChild();
          }}
          className="border-2 border-alice-teal text-alice-teal py-[11px] px-6 rounded-xl font-semibold hover:bg-alice-teal hover:text-white transition-colors"
        >
          Add Child
        </button>
      </div>

      <hr className="my-6 border-alice-gray" />

      {fields.map((field, idx) => (
        <div
          key={field.id}
          className="mb-4 lg:mb-8 border border-alice-gray rounded-xl p-4 lg:p-6 relative bg-white w-full"
        >
          <Controller
            name={`children.${idx}.id`}
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  readOnly
                  type='hidden'
                  className="w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-gray-100 text-gray-600 text-[14px] lg:text-base font-normal outline-none"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(idx, field.value)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#F00044] text-white font-semibold flex items-center gap-1 px-3 py-1.5 sm:px-[10px] sm:py-[5px] rounded-md hover:bg-[#e6002e] transition-colors text-sm"
                  >
                    <svg
                      width="18"
                      height="18"
                      className="me-[6px]"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.75 3.75H2.25C2.05109 3.75 1.86032 3.82902 1.71967 3.96967C1.57902 4.11032 1.5 4.30109 1.5 4.5C1.5 4.69891 1.57902 4.88968 1.71967 5.03033C1.86032 5.17098 2.05109 5.25 2.25 5.25H3.75V14.25C3.75018 14.8467 3.98729 15.4189 4.40921 15.8408C4.83113 16.2627 5.40332 16.4998 6 16.5H12C12.5967 16.4998 13.1689 16.2627 13.5908 15.8408C14.0127 15.4189 14.2498 14.8467 14.25 14.25V5.25H15.75C15.9489 5.25 16.1397 5.17098 16.2803 5.03033C16.421 4.88968 16.5 4.69891 16.5 4.5C16.5 4.30109 16.421 4.11032 16.2803 3.96967C16.1397 3.82902 15.9489 3.75 15.75 3.75ZM8.25 12C8.25 12.1989 8.17098 12.3897 8.03033 12.5303C7.88968 12.671 7.69891 12.75 7.5 12.75C7.30109 12.75 7.11032 12.671 6.96967 12.5303C6.82902 12.3897 6.75 12.1989 6.75 12V8.25C6.75 8.05109 6.82902 7.86032 6.96967 7.71967C7.11032 7.57902 7.30109 7.5 7.5 7.5C7.69891 7.5 7.88968 7.57902 8.03033 7.71967C8.17098 7.86032 8.25 8.05109 8.25 8.25V12ZM11.25 12C11.25 12.1989 11.171 12.3897 11.0303 12.5303C10.8897 12.671 10.6989 12.75 10.5 12.75C10.3011 12.75 10.1103 12.671 9.96967 12.5303C9.82902 12.3897 9.75 12.1989 9.75 12V8.25C9.75 8.05109 9.82902 7.86032 9.96967 7.71967C10.1103 7.57902 10.3011 7.5 10.5 7.5C10.6989 7.5 10.8897 7.57902 11.0303 7.71967C11.171 7.86032 11.25 8.05109 11.25 8.25V12Z"
                        fill="white"
                      />
                      <path
                        d="M7.5 3H10.5C10.6989 3 10.8897 2.92098 11.0303 2.78033C11.171 2.63968 11.25 2.44891 11.25 2.25C11.25 2.05109 11.171 1.86032 11.0303 1.71967C10.8897 1.57902 10.6989 1.5 10.5 1.5H7.5C7.30109 1.5 7.11032 1.57902 6.96967 1.71967C6.82902 1.86032 6.75 2.05109 6.75 2.25C6.75 2.44891 6.82902 2.63968 6.96967 2.78033C7.11032 2.92098 7.30109 3 7.5 3Z"
                        fill="white"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </>
            )}
          />

          <div className="mb-3 font-bold text-base sm:text-lg lg:text-xl">
            {idx + 1}
            {idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Child Information
          </div>

          {/* First / Middle / Last Name */}
          <div className="flex flex-col md:flex-row flex-wrap gap-4 sm:gap-6 mb-6 lg:mb-9">
            {/* First Name */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
                <span className="bg-[#FEFCF8] px-[5px]">Child’s First Name <span className="text-red-500">*</span></span>
              </label>

              <Controller
                name={`children.${idx}.firstName`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Child’s First Name"
                    className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${errors?.children?.[idx]?.firstName ? 'border-red-500' : 'border-alice-gray'
                      }`}
                  />
                )}
              />
              {errors?.children?.[idx]?.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.children[idx].firstName?.message}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
                <span className="bg-[#FEFCF8] px-[5px]">Child’s Middle Name <span className="text-red-500">*</span></span>
              </label>
              <Controller
                name={`children.${idx}.middleName`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Child’s Middle Name"
                    className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${errors?.children?.[idx]?.middleName ? 'border-red-500' : 'border-alice-gray'
                      }`}
                  />
                )}
              />

              {errors?.children?.[idx]?.middleName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.children[idx].middleName?.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
                <span className="bg-[#FEFCF8] px-[5px]">Child’s Last Name <span className="text-red-500">*</span></span>
              </label>
              <Controller
                name={`children.${idx}.lastName`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Child’s Last Name"
                    className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${errors?.children?.[idx]?.lastName ? 'border-red-500' : 'border-alice-gray'
                      }`}
                  />
                )}
              />
              {errors?.children?.[idx]?.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.children[idx].lastName?.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="mb-6 lg:mb-9">
            <label className="block text-base font-semibold mb-3 text-alice-black">Gender</label>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 lg:gap-24 mt-1">
              {['Boy', 'Girl', 'Prefer not to say'].map((option) => (
                <Controller
                  key={option}
                  name={`children.${idx}.gender`}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-[10px] text-sm lg:text-base font-normal text-alice-black">
                      <input
                        type="radio"
                        value={option}
                        checked={field.value === option}
                        onChange={() => field.onChange(option)}
                        className="accent-alice-black w-5 h-5 border-2"
                      />
                      {option}
                    </label>
                  )}
                />
              ))}
            </div>
            {errors?.children?.[idx]?.gender && (
              <p className="text-red-500 text-sm mt-2">
                {errors.children[idx].gender?.message}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-left text-[14px] lg:text-base font-semibold text-alice-black relative ms-[12px] mt-[2px]">
                <span className="bg-[#FEFCF8] px-[5px]">Date of Birth (DOB) <span className="text-red-500">*</span></span>
              </label>
              <Controller
                name={`children.${idx}.dob`}
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    className={`w-full px-5 py-[14px] lg:py-[18px] border rounded-[12px] mt-[-10px] lg:mt-[-12px] bg-white placeholder:text-alice-darkgray text-alice-black text-[14px] lg:text-base font-normal outline-[.2px] focus:outline-alice-teal ${errors?.children?.[idx]?.dob ? 'border-red-500' : 'border-alice-gray'
                      }`}
                  />
                )}
              />
              {errors?.children?.[idx]?.dob && (
                <p className="text-red-500 text-sm mt-1">{errors.children[idx].dob?.message}</p>
              )}
            </div>
          </div>
        </div>
      ))}

    </div>
  );
});

export default Step1ChildInfo;

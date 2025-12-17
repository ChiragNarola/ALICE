import { useForm } from "react-hook-form";
import Modal from "../ui/Modal";
import { Check } from "lucide-react";
import { useState } from "react";

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (title: string, holiday_date: string) => void;
}

interface FormValues {
  title: string;
  holiday_date: string;
}

export default function AddHolidayModal({ isOpen, onClose, onAdd }: AddHolidayModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      if (onAdd) {
        onAdd(data.title.trim(), data.holiday_date);
      }
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Add New Holiday" onClose={onClose}>
      <form className="flex flex-col space-y-2" onSubmit={handleSubmit(onSubmit)}>
        {/* Holiday Name */}
        <div>
          <label htmlFor="title" className="mb-1 text-sm font-medium text-gray-700">
            Holiday Name <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter Holiday Name..."
            {...register("title", { required: "Holiday name is required" })}
            className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.title ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
        </div>

        {/* Holiday Date */}
        <div>
          <label htmlFor="holiday_date" className="mb-1 text-sm font-medium text-gray-700">
            Holiday Date <span className="text-red-500">*</span>
          </label>
          <input
            id="holiday_date"
            type="date"
            {...register("holiday_date", { required: "Holiday date is required" })}
            className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.holiday_date ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.holiday_date && <p className="text-red-500 text-xs">{errors.holiday_date.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Submitting...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
import { Check } from "lucide-react";
import { useState } from "react";

interface AddAreaOfInterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (areaOfInterest: string) => void;
}

interface FormValues {
    areaOfInterest: string;
}

export default function AddAreaOfInterestModal({ isOpen, onClose, onAdd }: AddAreaOfInterestModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
    const [loading, setLoading] = useState(false);


    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {

            await new Promise((resolve) => setTimeout(resolve, 1000));

            onAdd(data.areaOfInterest.trim());
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
        <Modal title="Add New Area of Interest" onClose={onClose}>
            <form className="flex flex-col space-y-2" onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="areaOfInterest" className="mb-1 text-sm font-medium text-gray-700">
                    Area of Interest Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="areaOfInterest"
                    type="text"
                    placeholder="Enter Area of Interest..."
                    {...register("areaOfInterest", { required: "Area of Interest title is required" })}
                    className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.areaOfInterest ? "border-red-500" : "border-gray-300"}`
                    }
                />
                {errors.areaOfInterest && <p className="text-red-500 text-xs">{errors.areaOfInterest.message}</p>}

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
                        className={`px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
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

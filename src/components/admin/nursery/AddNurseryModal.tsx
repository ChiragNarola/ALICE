import { useForm } from "react-hook-form";
import Modal from "../../ui/Modal";
import { Check } from "lucide-react";
import { useState } from "react";

interface AddNurseryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (nursery_name: string, description:string) => void;
}

interface FormValues {
    nursery_name: string;
    description: string;
}

export default function AddNurseryModal({ isOpen, onClose, onAdd }: AddNurseryModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
    const [loading, setLoading] = useState(false);


    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {

            await new Promise((resolve) => setTimeout(resolve, 1000));

            onAdd(data.nursery_name.trim(),data.description.trim());
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
        <Modal title="Add New Nursery" onClose={onClose}>
            <form className="flex flex-col space-y-2" onSubmit={handleSubmit(onSubmit)}>
                <div>
                <label htmlFor="nurseryName" className="mb-1 text-sm font-medium text-gray-700">
                    Nursery Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="nursery_name"
                    type="text"
                    placeholder="Enter Nursery Name..."
                    {...register("nursery_name", { required: "Nursery name is required" })}
                    className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.nursery_name ? "border-red-500" : "border-gray-300"}`
                    }
                />
                {errors.nursery_name && <p className="text-red-500 text-xs">{errors.nursery_name.message}</p>}
                </div>

                <div>
               <label htmlFor="description" className="mb-1 text-sm font-medium text-gray-700">
                    Overview <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                    (This will be used by the agent to give context about this nursery)
                    </p>
                <input
                    id="description"
                    type="text"
                    placeholder="Enter Description..."
                    {...register("description", { required: "Overview is required" })}
                    className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.description ? "border-red-500" : "border-gray-300"}`
                    }
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                </div>



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

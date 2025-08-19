import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

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

    const onSubmit = (data: FormValues) => {
        onAdd(data.areaOfInterest.trim());
        reset();
        onClose();
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
                    <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>
                        Cancel
                    </Button>
                    <Button type="submit">Add</Button>
                </div>
            </form>
        </Modal>
    );
}

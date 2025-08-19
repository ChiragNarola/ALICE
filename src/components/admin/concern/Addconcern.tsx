import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { toast } from "react-toastify";

interface AddConcernModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (concern: string) => void;
}

interface FormValues {
    concern: string;
}

export default function AddConcernModal({ isOpen, onClose, onAdd }: AddConcernModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

    const onSubmit = (data: FormValues) => {
        onAdd(data.concern.trim());
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal title="Add New Concern" onClose={onClose}>
            <form className="flex flex-col space-y-2" onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="concern" className="mb-1 text-sm font-medium text-gray-700">
                    Concern Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="concern"
                    type="text"
                    placeholder="Enter concern..."
                    {...register("concern", { required: "Concern is required" })}
                    className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.concern ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.concern && <p className="text-red-500 text-xs">{errors.concern.message}</p>}

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

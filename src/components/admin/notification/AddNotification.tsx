import { Bell } from "lucide-react";
import Button from "../../ui/Button";
import React, { useCallback, useEffect, useState } from "react";
import AliceSelect from "../../ui/AliceSelect";
import { toast } from "react-toastify";
import { getNursery } from "../../../api/api-services";

interface Props {
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    handleSubmit: (e: React.FormEvent) => void;
    submitLoading: boolean;
}

type NuseryOption = {
    label: string,
    value: string,
}
export const AddNotification = ({ form, handleSubmit, setForm, submitLoading }: Props) => {

    const [nurseryList, setNurseryList] = useState<NuseryOption[]>([]);

    const fetchNursery = useCallback(async () => {
        try {
            const response = await getNursery();
            if (response.IsSuccess && response.Data) {
                const mappedNursery: NuseryOption[] = response.Data.map((n) => ({
                    value: n.id.toString(),
                    label: n.nursery_name,
                }))
                setNurseryList(mappedNursery);
            }
        } catch (err: any) {
            console.error("Failed to fetch nursery", err.Message);
            toast.error(err.Message || " Failed to fetch nursery");
        }
    }, []);

    useEffect(() => {
        fetchNursery();
    }, [fetchNursery]);

    const targetOptions = [
        { label: "Parent", value: "parent" },
        { label: "Staff", value: "staff" },
        { label: "Both", value: "both" },
    ];

    return (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-200 p-6 md:p-10 shadow-2xl shadow-alice-teal/5">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-2 bg-alice-teal text-white rounded-lg">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
                    <p className="text-sm text-gray-500">Set new notification.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-10 gap-y-8" >
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Title
                    </label>

                    <input
                        required
                        placeholder="e.g. Holiday Tomorrow"
                        title="Enter a short notice title for parents and students"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-900 placeholder:text-gray-300"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Message
                    </label>

                    <input
                        required
                        placeholder="e.g. Nursery classes will remain closed tomorrow due to staff training."
                        title="Enter the full notice message for parents"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-900 placeholder:text-gray-300"
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Nursery
                    </label>
                    <AliceSelect
                        value={form.nursery}
                        placeholder="Select nursery from the list"
                        onChange={(val) => setForm({ ...form, nursery: val })}
                        options={nurseryList}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Target Group
                    </label>
                    <AliceSelect
                        value={form.targetGroup}
                        placeholder="Select target group from the list"
                        onChange={(val) => setForm({ ...form, targetGroup: val })}
                        options={targetOptions}
                    />
                </div>

                <div className="md:col-span-2 flex justify-end pt-6">
                    <Button
                        type="submit"
                        disabled={submitLoading}
                        className="bg-alice-teal text-white w-full md:w-auto px-12 py-5 rounded-2xl shadow-2xl shadow-alice-teal/30 hover:bg-teal-700 hover:-translate-y-1 transition-all font-semibold text-base ring-4 ring-alice-teal/5"
                    >
                        {submitLoading ? "Creating..." : "Add Notification"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
export default AddNotification;
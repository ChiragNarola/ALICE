import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { getNursery, assignNursery } from "../../../api/api-services";
import { Bounce, toast } from "react-toastify";

interface Nursery {
    nursery_id: number;
    nursery_name: string;
}

interface AssignNurseryModalProps {
    open: boolean;
    onClose: (shouldRefresh?: boolean) => void;
    userId?: number;
    existingNursery?: Nursery[];
}

export default function AssignNurseryModal({
    open,
    onClose,
    userId,
    existingNursery = [],
}: AssignNurseryModalProps) {
    const [nurseryList, setNurseryList] = useState<Nursery[]>([]);
    const [selectedNursery, setSelectedNursery] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            fetchNurseryList();
            const ids = existingNursery.map((n) => n.nursery_id);
            setSelectedNursery(ids);
        }
    }, [open]);

    const fetchNurseryList = async () => {
        try {
            setLoading(true);
            const res = await getNursery();

            if (res.IsSuccess && Array.isArray(res.Data)) {
                const list = res.Data.map((n: any) => ({
                    nursery_id: n.id,
                    nursery_name: n.nursery_name,
                }));

                setNurseryList(list);
            }
        } catch (err) {
            console.error("Failed to fetch nursery", err);
        }
        finally {
            setTimeout(() => { setLoading(false) }
                , 300);
        }
    };

    const handleSave = async () => {
        try {
            if (!userId) return;
            const newNursery = selectedNursery.filter(
                (id) => !existingNursery.some(n => n.nursery_id === id)
            );
            const payload = {
                user_id: userId,
                nursery_id: newNursery
            };
            const result = await assignNursery(payload);
            if (result.IsSuccess) {
                onClose(true);
                toast.success('Nusery assigned successfully', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.Message || "Failed to add nursery.");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-[500px] rounded-xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold">Assign Nursery</h2>
                    <button onClick={() => onClose(false)}>✕</button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[160px]">
                        <p className="text-alice-black text-sm font-semibold animate-pulse">
                            Loading nurseries...
                        </p>
                    </div>
                ) : (
                    <>
                        <label className="block text-sm font-semibold mb-2">
                            Nursery Name
                        </label>
                        <Listbox value={selectedNursery} onChange={setSelectedNursery} multiple>
                            {
                                ({ open: listOpen }) => (
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full px-4 py-3 text-left border rounded-lg">
                                            <span className="block truncate">
                                                {selectedNursery.length > 0
                                                    ? nurseryList
                                                        .filter((n) =>
                                                            selectedNursery.includes(n.nursery_id)
                                                        )
                                                        .map((n) => n.nursery_name)
                                                        .join(", ")
                                                    : "Select nursery"}
                                            </span>

                                            <span className="absolute inset-y-0 right-3 flex items-center">
                                                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                            </span>
                                        </Listbox.Button>

                                        <Transition
                                            as={Fragment}
                                            show={listOpen}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white border shadow-lg">
                                                {nurseryList.map((nur) => (
                                                    <Listbox.Option
                                                        key={nur.nursery_id}
                                                        value={nur.nursery_id}
                                                        className={({ active }) =>
                                                            `cursor-pointer select-none py-2 px-4 ${active
                                                                ? "bg-alice-teal text-white"
                                                                : "text-gray-700"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected, active }) => (
                                                            <div className="flex justify-between">
                                                                <span>{nur.nursery_name}</span>

                                                                {selected && (
                                                                    <CheckIcon className={`w-5 h-5 ${active ? "text-white" : "text-green-600"}`} />
                                                                )}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                )
                            }
                        </Listbox >
                        < div className="flex justify-end gap-3 mt-6" >
                            <button
                                onClick={() => onClose(false)}
                                className="px-4 py-2 border rounded-lg">
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-alice-teal text-white rounded-lg">
                                Save
                            </button>
                        </div >
                    </>
                )}
            </div >
        </div >
    );
}
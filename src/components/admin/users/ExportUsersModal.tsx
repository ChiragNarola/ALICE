import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportUsers } from '../../../api/api-services';
import { toast } from "react-toastify";

interface ExportUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportUsersModal({ isOpen, onClose }: ExportUsersModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates.");
            return;
        }

        setLoading(true);
        try {
            const blob = await exportUsers({ start_date: startDate, end_date: endDate });

            // Create download link for the blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // You can adjust the file extension based on what your API returns (e.g., .csv, .xlsx)
            link.setAttribute('download', `users_export_${startDate}_to_${endDate}.xlsx`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Export successful!");
            onClose();
        } catch (error: any) {
            toast.error(error?.Message || "Failed to export users.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStartDate('');
        setEndDate('');
        setLoading(false);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center mb-4"
                                >
                                    Export Users
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </Dialog.Title>

                                <form onSubmit={handleExport} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a] outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex justify-center items-center gap-2 rounded-lg bg-[#134e4a] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3e3b] focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:ring-offset-2 disabled:bg-[#134e4a]/70"
                                        >
                                            {loading ? 'Exporting...' : (
                                                <>
                                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                                    Export
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
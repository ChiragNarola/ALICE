import { Bell } from "lucide-react";
import AddNotification from "./AddNotification";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPastNotification, sendNotification } from "../../../api/api-services";
import type { NotificationDto } from "../../../routes/models/response/Response";
import NotificationList from "./NotificationList";

export default function NotificationContainer() {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);

    const [form, setForm] = useState({
        title: "",
        body: "",
        targetGroup: "",
        nursery: "",
    });
    const fetchPastNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPastNotification();
            if (response.IsSuccess && response.Data) {
                setNotifications(response.Data);
                toast.success("Notification send successfully");
            }
        } catch (error: any) {
            toast.error(error.Message || "Unable to fetch past notifications");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchPastNotifications();
    }, [fetchPastNotifications]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.targetGroup) {
            toast.error("Please select a target group");
            return;
        }
        if (!form.nursery) {
            toast.error("Please select a nurser");
            return;
        }
        if (!form.title || !form.body) {
            toast.error("Code name, max uses and discount are required");
            return;
        }
        setSubmitLoading(true);
        try {
            const payload: any = {
                title: form.title,
                body: form.body,
                targets: [
                    form.targetGroup,
                    form.nursery
                ]
            }
            const res = await sendNotification(payload);
            if (res.IsSuccess) {
                toast.success("Notification added successfullu");
                setForm({
                    title: "",
                    body: "",
                    nursery: "",
                    targetGroup: ""
                });
                await fetchPastNotifications();
            }
            else {
                toast.error(res?.Message || "Failed to create code");
            }
        } catch (error: any) {
            toast.error(error?.Message || "Something went wrong");
        } finally {
            setSubmitLoading(false);
        }
    }
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Bell className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Notification Management</h1>
                        <p className="text-sm text-gray-500">View and send notifications.</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col gap-6">
                <AddNotification
                    form={form}
                    setForm={setForm}
                    handleSubmit={handleSubmit}
                    submitLoading={submitLoading}
                />
                <NotificationList
                    notifications={notifications}
                    loading={loading} />
            </div>
        </div>
    );
}

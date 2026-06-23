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
    question: "",
    is_auto: false,
    is_scheduled: false,
    scheduled_at: "", // datetime-local string interpreted directly as UTC, e.g. "2026-06-25T10:00"
  });

  const fetchPastNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPastNotification();
      if (response.IsSuccess && response.Data) {
        setNotifications(response.Data);
        // ← removed toast.success here, it's a fetch not an action
      }
    } catch (error: any) {
      toast.error(error?.Message || "Unable to fetch past notifications");
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
    if (!form.title || !form.body) {
      toast.error("Title and message are required");
      return;
    }
    if (form.is_scheduled && !form.scheduled_at) {
      toast.error("Please pick a date and time to schedule the notification");
      return;
    }

    setSubmitLoading(true);
    try {
      // "both" → ["parent", "staff"], others → ["parent"] or ["staff"]
      const targets =
        form.targetGroup === "both"
          ? ["parent", "staff"]
          : [form.targetGroup];

      // The picker's value is treated as UTC directly — no timezone
      // conversion. "2026-06-25T10:00" becomes "2026-06-25T10:00:00" and is
      // sent as-is, matching the backend's naive DateTime column and
      // datetime.utcnow() comparisons exactly.
      const scheduledAtIso = form.is_scheduled && form.scheduled_at
        ? `${form.scheduled_at}:00`
        : null;

      const payload = {
        title: form.title,
        body: form.body,
        targets,
        question: form.question,
        is_editable: !form.is_auto,
        scheduled_at: scheduledAtIso,
      };

      console.log("Sending payload:", payload);

      const res = await sendNotification(payload);
      if (res.IsSuccess) {
        toast.success(
          form.is_scheduled
            ? "Notification scheduled successfully"
            : "Notification sent successfully"
        );
        setForm({
          title: "",
          body: "",
          targetGroup: "",
          question: "",
          is_auto: false,
          is_scheduled: false,
          scheduled_at: "",
        });
        await fetchPastNotifications();
      } else {
        toast.error(res?.Message || "Failed to send notification");
      }
    } catch (error: any) {
      toast.error(error?.Message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Bell className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Notification Management
            </h1>
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
        <NotificationList notifications={notifications} loading={loading} />
      </div>
    </div>
  );
}
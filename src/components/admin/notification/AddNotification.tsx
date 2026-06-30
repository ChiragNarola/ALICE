import { Bell, Repeat2, CalendarClock } from "lucide-react";
import Button from "../../ui/Button";
import React from "react";
import AliceSelect from "../../ui/AliceSelect";

function nowInUtc(): string {
  return new Date().toISOString().slice(0, 16);
}

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
}

export const AddNotification = ({
  form,
  handleSubmit,
  setForm,
  submitLoading,
}: Props) => {
  const targetOptions = [
    { label: "Parent", value: "parent" },
    { label: "Staff", value: "staff" },
    { label: "Both", value: "both" },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-12 shadow-xl shadow-gray-100">

      {/* Header */}
      <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-100">
        <div className="p-2 bg-alice-teal text-white rounded-lg">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg md:text-2xl font-semibold text-gray-900">Send Notification</h3>
          <p className="text-sm text-gray-400 mt-0.5">Compose and send to your audience.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Row 1 — Title + Message */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              required
              placeholder="e.g. Holiday Tomorrow"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-alice-teal/20 focus:border-alice-teal transition-all"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Message <span className="text-red-400">*</span>
            </label>
            <input
              required
              placeholder="e.g. Nursery classes will remain closed tomorrow."
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-alice-teal/20 focus:border-alice-teal transition-all"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
        </div>

        {/* Row 2 — Target Group + Question */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Target Group <span className="text-red-400">*</span>
            </label>
            <AliceSelect
              value={form.targetGroup}
              placeholder="Select target group"
              onChange={(val) => setForm({ ...form, targetGroup: val })}
              options={targetOptions}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Question
            </label>
            <input
              placeholder="e.g. Will your child attend?"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-alice-teal/20 focus:border-alice-teal transition-all"
              value={form.question ?? ""}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
          </div>
        </div>

        {/* Row 3 — Auto-ask + Schedule toggles side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Auto-ask toggle */}
          <button
            type="button"
            onClick={() => setForm({ ...form, is_auto: !form.is_auto })}
            className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 text-left ${
              form.is_auto
                ? "bg-alice-teal/5 border-alice-teal/30"
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${form.is_auto ? "bg-alice-teal/10 text-alice-teal" : "bg-gray-200 text-gray-400"}`}>
                <Repeat2 className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-sm font-bold transition-colors ${form.is_auto ? "text-alice-teal" : "text-gray-700"}`}>
                  Auto-ask
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Send question to chat</p>
              </div>
            </div>
            <div className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${form.is_auto ? "bg-alice-teal" : "bg-gray-200"}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${form.is_auto ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>

          {/* Schedule toggle */}
          <button
            type="button"
            onClick={() =>
              setForm((prev: any) => ({
                ...prev,
                is_scheduled: !prev.is_scheduled,
                scheduled_at: prev.is_scheduled ? "" : prev.scheduled_at,
              }))
            }
            className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 text-left ${
              form.is_scheduled
                ? "bg-alice-teal/5 border-alice-teal/30"
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${form.is_scheduled ? "bg-alice-teal/10 text-alice-teal" : "bg-gray-200 text-gray-400"}`}>
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-sm font-bold transition-colors ${form.is_scheduled ? "text-alice-teal" : "text-gray-700"}`}>
                  Schedule for later
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Send at a future date & time</p>
              </div>
            </div>
            <div className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${form.is_scheduled ? "bg-alice-teal" : "bg-gray-200"}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${form.is_scheduled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>
        </div>

        {form.is_scheduled && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Send At <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400 font-medium">Date</p>
                <input
                  type="date"
                  required={form.is_scheduled}
                  min={nowInUtc().slice(0, 10)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-alice-teal/20 focus:border-alice-teal transition-all"
                  value={form.scheduled_at?.slice(0, 10) ?? ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = form.scheduled_at?.slice(11, 16) ?? "00:00";
                    setForm({ ...form, scheduled_at: `${date}T${time}` });
                  }}
                />
              </div>
              {/* Time */}
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400 font-medium">Time (UTC)</p>
                <div className="flex items-center gap-2">
                  <select
                    required={form.is_scheduled}
                    className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-alice-teal/20 focus:border-alice-teal transition-all appearance-none"
                    value={form.scheduled_at?.slice(11, 13) ?? ""}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const date = form.scheduled_at?.slice(0, 10) ?? nowInUtc().slice(0, 10);
                      const min = form.scheduled_at?.slice(14, 16) ?? "00";
                      setForm({ ...form, scheduled_at: `${date}T${hour}:${min}` });
                    }}
                  >
                    <option value="" disabled>HH</option>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <span className="text-gray-400 font-semibold">:</span>

                  <select
                    required={form.is_scheduled}
                    className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-alice-teal/20 focus:border-alice-teal transition-all appearance-none"
                    value={form.scheduled_at?.slice(14, 16) ?? ""}
                    onChange={(e) => {
                      const min = e.target.value;
                      const date = form.scheduled_at?.slice(0, 10) ?? nowInUtc().slice(0, 10);
                      const hour = form.scheduled_at?.slice(11, 13) ?? "00";
                      setForm({ ...form, scheduled_at: `${date}T${hour}:${min}` });
                    }}
                  >
                    <option value="" disabled>MM</option>
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
          </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={submitLoading}
            className="bg-alice-teal text-white px-10 py-4 rounded-xl shadow-lg shadow-alice-teal/20 hover:bg-teal-700 hover:-translate-y-0.5 active:translate-y-0 transition-all font-semibold text-sm"
          >
            {submitLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {form.is_scheduled ? "Scheduling..." : "Sending..."}
              </span>
            ) : form.is_scheduled ? (
              <span className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Schedule Notification
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Send Notification
              </span>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default AddNotification;
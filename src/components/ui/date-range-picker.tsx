// import React from "react";
import type { DateParams } from "../../routes/models/request/AdminRequest";

interface DateRangePickerProps {
  value: DateParams;
  onChange?: (range: DateParams) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const handleChange = (field: "start_date" | "end_date", val: string) => {
    const updated = { ...value, [field]: val };
    onChange?.(updated);
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="date"
        value={value.start_date}
        onChange={(e) => handleChange("start_date", e.target.value)}
        className="border rounded-lg px-2 py-1"
      />
      <span>to</span>
      <input
        type="date"
        value={value.end_date}
        onChange={(e) => handleChange("end_date", e.target.value)}
        className="border rounded-lg px-2 py-1"
      />
    </div>
  );
}

import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface UpdatePinModalProps {
  updatePinData: {
    old_pin: string;
    new_pin: string;
    confirm_new_pin: string;
  };
  setUpdatePinData: React.Dispatch<
    React.SetStateAction<{
      old_pin: string;
      new_pin: string;
      confirm_new_pin: string;
    }>
  >;
  errors: { [key: string]: string };
  showOldPin: boolean;
  setShowOldPin: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPin: boolean;
  setShowNewPin: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmNewPin: boolean;
  setShowConfirmNewPin: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  handleUpdatePin: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function UpdatePinModal({
  updatePinData,
  setUpdatePinData,
  errors,
  showOldPin,
  setShowOldPin,
  showNewPin,
  setShowNewPin,
  showConfirmNewPin,
  setShowConfirmNewPin,
  loading,
  handleUpdatePin,
  onClose,
}: UpdatePinModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Update PIN
        </h3>

        <form onSubmit={handleUpdatePin} className="space-y-4">
          {/* Old PIN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old PIN <span className="text-red-500">*</span>
            </label>
            <input
              type={showOldPin ? "text" : "password"}
              value={updatePinData.old_pin}
              onChange={(e) =>
                setUpdatePinData({ ...updatePinData, old_pin: e.target.value })
              }
              className={`w-full border ${
                errors.old_pin
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-alice-teal"
              } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
            />
            <button
              type="button"
              onClick={() => setShowOldPin(!showOldPin)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            >
              {showOldPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.old_pin && (
              <p className="text-red-500 text-sm mt-1">{errors.old_pin}</p>
            )}
          </div>

          {/* New PIN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New PIN <span className="text-red-500">*</span>
            </label>
            <input
              type={showNewPin ? "text" : "password"}
              value={updatePinData.new_pin}
              onChange={(e) =>
                setUpdatePinData({ ...updatePinData, new_pin: e.target.value })
              }
              className={`w-full border ${
                errors.new_pin
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-alice-teal"
              } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
            />
            <button
              type="button"
              onClick={() => setShowNewPin(!showNewPin)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            >
              {showNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.new_pin && (
              <p className="text-red-500 text-sm mt-1">{errors.new_pin}</p>
            )}
          </div>

          {/* Confirm New PIN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New PIN <span className="text-red-500">*</span>
            </label>
            <input
              type={showConfirmNewPin ? "text" : "password"}
              value={updatePinData.confirm_new_pin}
              onChange={(e) =>
                setUpdatePinData({
                  ...updatePinData,
                  confirm_new_pin: e.target.value,
                })
              }
              className={`w-full border ${
                errors.confirm_new_pin
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-alice-teal"
              } rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPin(!showConfirmNewPin)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            >
              {showConfirmNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirm_new_pin && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm_new_pin}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg bg-alice-teal text-white font-semibold hover:bg-teal-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

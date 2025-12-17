import Modal from "../../ui/Modal";
import { Check, XCircle } from "lucide-react";

interface NurseryItem {
  nursery_id: number;
  nursery_name: string;
  status: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  nurseries: NurseryItem[];
  onStatusChange: (nursery_id: number, action: "approved" | "rejected") => void;
  bulkApprove: () => void;
  bulkReject: () => void;
}

export default function ApproveRejectModal({
  isOpen,
  onClose,
  staffName,
  nurseries,
  onStatusChange,
  bulkApprove,
  bulkReject,
}: Props) {
  if (!isOpen) return null;

  const pendingCount = nurseries.filter(
    (n) => (n.status || "").toLowerCase() === "pending"
  ).length;

  return (
    <Modal title={`Review Nursery for ${staffName}`} onClose={onClose}>
      <div className="space-y-6 p-1">
        <hr className="border-gray-300 my-2" />

        {/* Nursery Listing */}
        <ul className="space-y-6 max-h-[340px] overflow-y-auto pr-2">
          {nurseries.map((n) => {
            const statusLower = (n.status || "").toLowerCase();
            return (
              <li
                key={n.nursery_id}
                className="border-b pb-4 last:border-none"
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="pt-[7px]">
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm"></div>
                  </div>

                  <div className="flex-1">
                    <span className="block text-base font-medium text-gray-900 mb-1">
                      {n.nursery_name}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2 uppercase tracking-wide ${
                        statusLower === "approved"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : statusLower === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {n.status ? n.status : "PENDING"}
                    </span>

                    {/* Action Buttons */}
                    {statusLower === "pending" && (
                      <div className="flex gap-3 mt-2">
                        <button
                          className="flex items-center gap-1 text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
                          onClick={() => onStatusChange(n.nursery_id, "approved")}
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                          onClick={() => onStatusChange(n.nursery_id, "rejected")}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Bulk Action Buttons */}
        {pendingCount > 1 && (
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={bulkApprove}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg"
            >
              Approve All
            </button>
            <button
              onClick={bulkReject}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
            >
              Reject All
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}

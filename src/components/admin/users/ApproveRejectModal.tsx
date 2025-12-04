import Modal from "../../ui/Modal";
import { Check, XCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: "APPROVED" | "REJECTED";
  staffName: string;
  nurseryName: string;
}

export default function ApproveRejectModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  staffName,
  nurseryName,
}: Props) {
  if (!isOpen) return null;

  return (
    <Modal title={`${actionType === "APPROVED" ? "Approve" : "Reject"} Nursery`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-700 text-sm">
          Are you sure you want to{" "}
          <span className={actionType === "APPROVED" ? "text-green-600" : "text-red-600"}>
            {actionType.toLowerCase()}
          </span>{" "}
          access for <strong>{staffName}</strong> in <strong>{nurseryName}</strong>?
        </p>

        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 ${
              actionType === "APPROVED"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {actionType === "APPROVED" ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}

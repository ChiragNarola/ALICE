import { useState, useEffect } from "react";
import { BadgeInfo, Plus, RefreshCw, X, Check } from "lucide-react";
import { Table, Th, Td } from "../ui/Table";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import { getAppVersions, createAppVersion } from "../../api/api-services";
import type { AppVersionItem } from "../../routes/models/response/Response";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ── Version badge ─────────────────────────────────────────────────────────────

function VersionBadge({ version }: { version: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
      <BadgeInfo className="w-3 h-3 flex-shrink-0" />
      v{version}
    </span>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b animate-pulse">
      {[60, 80, 140, 32].map((w, i) => (
        <Td key={i}>
          <div className="h-3.5 bg-gray-200 rounded" style={{ width: w }} />
        </Td>
      ))}
    </tr>
  );
}

// ── Add Version Modal ─────────────────────────────────────────────────────────

interface AddVersionModalProps {
  onClose: () => void;
  onSuccess: (v: AppVersionItem) => void;
}

function AddVersionModal({ onClose, onSuccess }: AddVersionModalProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await createAppVersion(value.trim());
      if (result?.IsSuccess) {
        onSuccess(result.Data);
      } else {
        setError(result?.Message || "Failed to add version");
      }
    } catch (e: any) {
      setError(e?.Message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BadgeInfo className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Add app version</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-sm font-medium text-gray-700">
            Version number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. 1.2.3"
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || loading}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-all flex items-center gap-2 ${
              !value.trim() || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Add version
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function AppVersionPage() {
  const [versions, setVersions] = useState<AppVersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await getAppVersions();
      if (res?.IsSuccess && Array.isArray(res.Data)) {
        setVersions(res.Data);
      } else {
        toast.error(res?.Message || "Failed to load app versions");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Failed to load app versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleAdded = (v: AppVersionItem) => {
    setVersions((prev) => [v, ...prev]);
    setAddModalOpen(false);
    toast.success(`Version v${v.app_version} added successfully`);
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BadgeInfo className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">App versions</h1>
            <p className="text-sm text-gray-500">Manage and track released app versions</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="teal"
          className="h-10 rounded-lg shadow flex items-center gap-1.5"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add version
        </Button>
      </div>

      <div className="overflow-hidden border rounded-lg shadow-sm">
        <Table>
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr.No</Th>
              <Th>Version</Th>
              <Th>Added on</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : versions.length === 0 ? (
              <tr>
                <Td colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <p className="text-sm font-medium text-gray-600">No app versions yet</p>
                  </div>
                </Td>
              </tr>
            ) : (
              versions.map((v, index) => (
                <tr key={v.id} className="border-b hover:bg-gray-50 transition">
                  <Td>{index + 1}</Td>
                  <Td><VersionBadge version={v.app_version} /></Td>
                  <Td className="text-gray-500">{formatDate(v.created_at)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {addModalOpen && (
        <AddVersionModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={handleAdded}
        />
      )}
    </div>
  );
}
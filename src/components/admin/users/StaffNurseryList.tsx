import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { Users, Search, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

import ApproveRejectModal from "./ApproveRejectModal";
import { getStaffNurseryStatus, updateStaffNurseryStatus } from "../../../api/api-services";

import type {
  StaffNurseryStatusDTO,
  StaffNurseryAssignmentDTO,
} from "../../../routes/models/response/Response";

// ==========================================================
// TYPE FOR GROUPED ROW
// ==========================================================
interface GroupedStaffRow {
  user_id: number;
  staff_name: string;
  email: string;
  age_group?: string | null;
  role_in_organisation?: string | null;
  qualification?: string | null;
  created_at?: string;
  nurseries: {
    nursery_id: number;
    nursery_name: string;
    status: string | null;
  }[];
}

export default function StaffNurseryList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [rows, setRows] = useState<GroupedStaffRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GroupedStaffRow | null>(null);

  const fetchStaffNursery = async () => {
    try {
      setLoading(true);
      const res = await getStaffNurseryStatus();

      if (res?.IsSuccess && Array.isArray(res.Data)) {
        const data: StaffNurseryStatusDTO[] = res.Data;

        // Flatten first
        const flattened = data.flatMap((staff) =>
          staff.nurseries.map((n: StaffNurseryAssignmentDTO) => ({
            user_id: staff.user_id,
            staff_name: `${staff.first_name} ${staff.last_name}`,
            email: staff.email,
            age_group: staff.age_group,
            role_in_organisation: staff.role_in_organisation,
            qualification: staff.qualification,
            nursery_id: n.nursery_id,
            nursery_name: n.nursery_name,
            status: n.status,
            created_at: staff.created_at,
          }))
        );

        const grouped: GroupedStaffRow[] = Object.values(
          flattened.reduce((acc: Record<number, GroupedStaffRow>, row) => {
            if (!acc[row.user_id]) {
              acc[row.user_id] = {
                user_id: row.user_id,
                staff_name: row.staff_name,
                email: row.email,
                age_group: row.age_group,
                role_in_organisation: row.role_in_organisation,
                qualification: row.qualification,
                created_at: row.created_at,
                nurseries: [],
              };
            }
            acc[row.user_id].nurseries.push({
              nursery_id: row.nursery_id,
              nursery_name: row.nursery_name,
              status: row.status,
            });
            return acc;
          }, {})
        );

        const sorted = grouped.sort((a, b) => {
        const aPending = a.nurseries.some(n => (n.status || "").toLowerCase() === "pending");
        const bPending = b.nurseries.some(n => (n.status || "").toLowerCase() === "pending");

        if (aPending && bPending) {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }

        if (aPending) return -1;
        if (bPending) return 1;

        return 0;
      });



        setRows(sorted);
      } else {
        toast.error(res?.Message || "Failed to load staff nursery data.");
      }
    } catch {
      toast.error("Failed to load staff nursery data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffNursery();
  }, []);

  const filteredRows = rows.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.staff_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.nurseries.some((n) => n.nursery_name.toLowerCase().includes(q))
    );
  });

  const totalRecords = filteredRows.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(start, start + pageSize);


  const openModal = (row: GroupedStaffRow) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleStatus = async (nursery_id: number, action: "approved" | "rejected") => {
    if (!selectedRow) return;
    try {
      const res = await updateStaffNurseryStatus({
        user_id: selectedRow.user_id,
        nursery_id,
        status: action,
      });

      if (res.IsSuccess) {
        toast.success(`Status changed to ${action}`);

        setSelectedRow((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            nurseries: prev.nurseries.map((n) =>
              n.nursery_id === nursery_id
                ? { ...n, status: action } 
                : n
            ),
          };
        });

        setRows((prev) =>
          prev.map((row) =>
            row.user_id === selectedRow.user_id
              ? {
                  ...row,
                  nurseries: row.nurseries.map((n) =>
                    n.nursery_id === nursery_id
                      ? { ...n, status: action }
                      : n
                  ),
                }
              : row
          )
        );
      } else {
        toast.error(res.Message || "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    }
  };


  const handleBulkChange = async (action: "approved" | "rejected") => {
    if (!selectedRow) return;

    const pendingNurseries = selectedRow.nurseries.filter(
      (n) => (n.status || "").toLowerCase() === "pending"
    );

    if (pendingNurseries.length === 0) return;

    try {
      for (const n of pendingNurseries) {
        await updateStaffNurseryStatus({
          user_id: selectedRow.user_id,
          nursery_id: n.nursery_id,
          status: action,
        });
      }
      toast.success(`All pending have been ${action}!`);

      setSelectedRow((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          nurseries: prev.nurseries.map((n) =>
            (n.status || "").toLowerCase() === "pending"
              ? { ...n, status: action }
              : n
          ),
        };
      });
      
      setRows((prev) =>
        prev.map((row) =>
          row.user_id === selectedRow.user_id
            ? {
                ...row,
                nurseries: row.nurseries.map((n) =>
                  (n.status || "").toLowerCase() === "pending"
                    ? { ...n, status: action }
                    : n
                ),
              }
            : row
        )
      );
    } catch {
      toast.error("Bulk update failed.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Staff Details
            </h1>
            <p className="text-sm text-gray-500">
              View nursery assignments for staff and their approval status.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="flex flex-col w-72">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Search by staff / nursery
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type staff name, email or nursery..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden border rounded-lg shadow-sm">
        <Table>
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr. No</Th>
              <Th>Staff Name</Th>
              <Th>Email</Th>
              <Th>Age Group</Th>
              <Th>Role in Organisation</Th>
              <Th>Qualification</Th>
              <Th>Nursery Count</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><Td colSpan={8} className="text-center py-6">Loading...</Td></tr>
            ) : paginatedRows.length === 0 ? (
              <tr><Td colSpan={8} className="text-center text-gray-500 py-4">No data found.</Td></tr>
            ) : (
              paginatedRows.map((row, index) => (
                <tr key={row.user_id} className="border-b hover:bg-gray-50 transition">
                  <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td className="font-medium text-gray-900">{row.staff_name}</Td>
                  <Td text-gray-600 >{row.email}</Td>
                  <Td>{row.age_group || "-"}</Td>
                  <Td>{row.role_in_organisation || "-"}</Td>
                  <Td>{row.qualification || "-"}</Td>
                  <Td className="flex items-center gap-1 !border-b-0">
                    {row.nurseries.length}
                    {row.nurseries.some(n => (n.status || "").toLowerCase() === "pending") && (
                      <div className="relative group">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 cursor-default" />

                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-5 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                          Approvals Pending 
                        </div>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <button
                      onClick={() => openModal(row)}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      ...
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalEntries={totalRecords}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* MODAL */}
      {selectedRow && (
        <ApproveRejectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          staffName={selectedRow?.staff_name || ""}
          nurseries={selectedRow?.nurseries || []}
          onStatusChange={handleStatus}
          bulkApprove={() => handleBulkChange("approved")}
          bulkReject={() => handleBulkChange("rejected")}
        />
      )}
    </div>
  );
}

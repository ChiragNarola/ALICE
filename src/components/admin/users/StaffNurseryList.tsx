import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { Users, Search, Hourglass, BadgeCheck, PlusIcon } from "lucide-react";
import { toast } from "react-toastify";

import ApproveRejectModal from "./ApproveRejectModal";
import { getStaffNurseryStatus, updateStaffNurseryStatus, updateStaffDailyCredits } from "../../../api/api-services";

import type {
  StaffNurseryStatusDTO,
  StaffNurseryAssignmentDTO,
} from "../../../routes/models/response/Response";
import AssignNurseryModal from "../nursery/AssignNurseryModal";

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
  bonus_credits?: number | null;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GroupedStaffRow | null>(null);
  const [editingCredits, setEditingCredits] = useState<{ userId: number; value: string } | null>(null);
  const [savingCredits, setSavingCredits] = useState(false);

  const fetchStaffNursery = async () => {
    try {
      setLoading(true);
      const res = await getStaffNurseryStatus();

      if (res?.IsSuccess && Array.isArray(res.Data)) {
        const data: StaffNurseryStatusDTO[] = res.Data;

        // Flatten first
        const flattened = data.flatMap((staff) => {
          if (!staff.nurseries || staff.nurseries.length === 0) {
            return [{
              user_id: staff.user_id,
              staff_name: `${staff.first_name} ${staff.last_name}`,
              email: staff.email,
              age_group: staff.age_group,
              role_in_organisation: staff.role_in_organisation,
              qualification: staff.qualification,
              nursery_id: 0,
              nursery_name: "",
              status: null,
              created_at: staff.created_at,
              bonus_credits: staff.bonus_credits,
            }];
          }

          return staff.nurseries.map((n: StaffNurseryAssignmentDTO) => ({
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
            bonus_credits: staff.bonus_credits,
          }));
        });


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
                bonus_credits: row.bonus_credits,
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
  const refreshStaffList = async () => {
    setCurrentPage(1);
    await fetchStaffNursery();
  };
  const handleModalClose = async (shouldRefresh?: boolean) => {
    setIsModalOpen(false);

    if (shouldRefresh) {
      await refreshStaffList();
    }
  };

  const totalRecords = filteredRows.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(start, start + pageSize);


  const openModal = (row: GroupedStaffRow) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const openNurseryModal = (row: GroupedStaffRow) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  }

  const handleStatus = async (nursery_id: number, action: "approved" | "rejected") => {
    if (!selectedRow) return;
    try {
      const res = await updateStaffNurseryStatus({
        user_id: selectedRow.user_id,
        nursery_id: [nursery_id],
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
    ).map(x => x.nursery_id);

    if (pendingNurseries.length === 0) return;
    try {
      await updateStaffNurseryStatus({
        user_id: selectedRow.user_id,
        nursery_id: pendingNurseries,
        status: action,
      });
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

  const handleCreditsSave = async () => {
    if (!editingCredits) return;
    const parsed = parseInt(editingCredits.value);
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    try {
      setSavingCredits(true);
      const res = await updateStaffDailyCredits({
        user_id: editingCredits.userId,
        bonus_credits: parsed,
      });
      if (res?.IsSuccess) {
        toast.success("Credits updated successfully");
        setRows((prev) =>
          prev.map((r) =>
            r.user_id === editingCredits.userId
              ? { ...r, bonus_credits: parsed }
              : r
          )
        );
        setEditingCredits(null);
      } else {
        toast.error(res?.Message || "Failed to update credits");
      }
    } catch {
      toast.error("Failed to update credits");
    } finally {
      setSavingCredits(false);
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
            Search by keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type staff name"
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
              <Th>Approve / Reject</Th>
              <Th>Chat Bonus Credits</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={8} className="text-center py-6">Loading...</Td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <Td colSpan={8} className="text-center text-gray-500 py-4">No data found.</Td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => (
                <tr key={row.user_id} className="border-b hover:bg-gray-50 transition">
                  <Td className="align-middle">
                    {(currentPage - 1) * pageSize + index + 1}
                  </Td>

                  <Td className="align-middle font-medium text-gray-900">
                    <div className="inline-flex items-center gap-2">
                      <span className="leading-none">{row.staff_name}</span>
                    </div>
                  </Td>

                  <Td className="align-middle text-gray-600">
                    {row.email}
                  </Td>

                  <Td className="align-middle">
                    {row.age_group || "-"}
                  </Td>

                  <Td className="align-middle">
                    {row.role_in_organisation || "-"}
                  </Td>

                  <Td className="align-middle">
                    {row.qualification || "-"}
                  </Td>

                  <Td className="align-middle !border-b-0">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-sm font-medium leading-none">{row.nurseries.length}</span>

                      {row.nurseries.some(n => (n.status || "").toLowerCase() === "pending") && (
                        <div className="relative group">
                          <div className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                            <Hourglass className="w-3 h-3" />
                          </div>

                          <div className="absolute left-1/2 -translate-x-1/2 top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
                            Pending Approvals
                          </div>
                        </div>
                      )}
                      <button onClick={() => openNurseryModal(row)}
                        aria-label="Open actions"
                        className="w-7 h-7 flex items-center justify-center rounded-md
                      border-teal-800 text-teal-800 border bg-transparent hover:bg-teal-800 hover:text-white transition focus:outline-none"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>

                  <Td className="align-middle">
                    <div className="inline-flex items-center">
                      <button
                        onClick={() => openModal(row)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                        aria-label="Open actions"
                      >
                        <BadgeCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>

                  <Td className="align-middle">
                    {editingCredits?.userId === row.user_id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          autoFocus
                          value={editingCredits.value}
                          onChange={(e) =>
                            setEditingCredits({ userId: row.user_id, value: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreditsSave();
                            if (e.key === "Escape") setEditingCredits(null);
                          }}
                          className="w-20 px-2 py-1 text-sm border border-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                        />
                        <button
                          onClick={handleCreditsSave}
                          disabled={savingCredits}
                          className="h-7 w-7 flex items-center justify-center rounded-md bg-teal-700 text-white hover:bg-teal-800 transition disabled:opacity-50"
                          title="Save"
                        >
                          {savingCredits ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingCredits(null)}
                          className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 transition"
                          title="Cancel"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${row.bonus_credits != null && row.bonus_credits > 0
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                            <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                            <text x="5" y="7.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">C</text>
                          </svg>
                          {row.bonus_credits ?? 0}
                        </span>
                        <button
                          onClick={() =>
                            setEditingCredits({
                              userId: row.user_id,
                              value: String(row.bonus_credits ?? 0),
                            })
                          }
                          className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition"
                          title="Edit credits"
                        >
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
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
      <AssignNurseryModal
        open={isModalOpen}
        onClose={handleModalClose}
        userId={selectedRow?.user_id}
        existingNursery={selectedRow?.nurseries}
      />
    </div>
  );
}

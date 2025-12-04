import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { Users, Search } from "lucide-react";
import { toast } from "react-toastify";

import { getStaffNurseryStatus, updateStaffNurseryStatus } from "../../../api/api-services";
import type {
  StaffNurseryStatusDTO,
  StaffNurseryAssignmentDTO,
} from "../../../routes/models/response/Response";
import ApproveRejectModal from "./ApproveRejectModal";

interface StaffNurseryRow {
  user_id: number;
  nursery_id: number;
  staff_name: string;
  email: string;
  nursery_name: string;
  age_group?: string | null;
  role_in_organisation?: string | null;
  qualification?: string | null;
  status?: string | null;
}

export default function StaffNurseryList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<StaffNurseryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStaffNursery = async () => {
    try {
      setLoading(true);
      const res = await getStaffNurseryStatus();

      if (res?.IsSuccess && Array.isArray(res.Data)) {
        const data: StaffNurseryStatusDTO[] = res.Data;

        const flattened: StaffNurseryRow[] = data.flatMap((staff) =>
          (staff.nurseries || []).map((n: StaffNurseryAssignmentDTO) => ({
            user_id: staff.user_id,
            nursery_id: n.nursery_id,
            staff_name: `${staff.first_name} ${staff.last_name}`,
            email: staff.email,
            nursery_name: n.nursery_name,
            age_group: staff.age_group,
            role_in_organisation: staff.role_in_organisation,
            qualification: staff.qualification,
            status: n.status,
          }))
        );

        setRows(flattened);
      } else {
        toast.error(res?.Message || "Failed to load staff nursery data.");
      }
    } catch (error: any) {
      console.error("Failed to load staff nursery data", error);
      toast.error(error?.Message || "Failed to load staff nursery data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffNursery();
  }, []);

  // search by staff name, email, or nursery name
  const filteredRows = rows.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.staff_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.nursery_name.toLowerCase().includes(q)
    );
  });

  // pagination
  const totalRecords = filteredRows.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(start, start + pageSize);

  // simple helper to color status
  const statusClass = (status?: string | null) => {
    const s = (status || "").toLowerCase();
    if (s === "approved")
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (s === "pending")
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    if (s === "rejected")
      return "bg-red-100 text-red-700 border border-red-200";
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const [selectedRow, setSelectedRow] = useState<StaffNurseryRow | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (row: StaffNurseryRow, type: "APPROVED" | "REJECTED") => {
    setSelectedRow(row);
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedRow || !actionType) return;
    
    try {
      const payload = {
        user_id: selectedRow.user_id,
        nursery_id: selectedRow.nursery_id,
        status: actionType.toLowerCase(),
      };

      const res = await updateStaffNurseryStatus(payload);

      if (res.IsSuccess) {
        toast.success(`Status updated to ${actionType}!`);
        fetchStaffNursery();
      } else {
        toast.error(res?.Message || "Failed to update status");
      }
    } catch (e: any) {
      toast.error(e?.Message || "Failed to update status");
    } finally {
      setModalOpen(false);
    }
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Staff Nursery Mapping
            </h1>
            <p className="text-sm text-gray-500">
              View nursery assignments for staff and their approval status.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="flex flex-col w-72">
          <label
            htmlFor="staff-nursery-search"
            className="mb-1 text-sm font-medium text-gray-700"
          >
            Search by staff / nursery
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="staff-nursery-search"
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

      {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm">
        <Table>
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr. No</Th>
              <Th>Staff Name</Th>
              <Th>Email</Th>
              <Th>Nursery</Th>
              <Th>Age Group</Th>
              <Th>Role in Organisation</Th>
              <Th>Qualification</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6">
                  <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 px-1">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <Td colSpan={8} className="text-center text-gray-500 py-4">
                  No staff nursery records found.
                </Td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => (
                <tr
                  key={`${row.user_id}-${row.nursery_id}-${index}`}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td className="font-medium text-gray-900">{row.staff_name}</Td>
                  <Td className="text-gray-600">{row.email}</Td>
                  <Td>{row.nursery_name}</Td>
                  <Td>{row.age_group || "-"}</Td>
                  <Td>{row.role_in_organisation || "-"}</Td>
                  <Td>{row.qualification || "-"}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${statusClass(
                        row.status
                      )}`}
                    >
                      {row.status ? row.status : "N/A"}
                    </span>
                  </Td>
                  <Td>
                    {row.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md"
                          onClick={() => openModal(row, "APPROVED")}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md"
                          onClick={() => openModal(row, "REJECTED")}
                        >
                          Reject
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

      {/* Pagination */}
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

      {/* modal */}
      <ApproveRejectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        staffName={selectedRow?.staff_name || ""}
        nurseryName={selectedRow?.nursery_name || ""}
        actionType={actionType || "APPROVED"}
      />
    </div>
  );
}

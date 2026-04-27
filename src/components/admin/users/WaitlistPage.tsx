import React, { useState, useEffect } from "react";
import { Clock, LayoutGrid, ChevronRight, ChevronLeft } from "lucide-react";
import { Table, Th, Td } from "../../ui/Table";
import Avatar from "react-avatar";
import { toast } from "react-toastify";
import AliceSelect from "../../ui/AliceSelect";
import {
  getPartners,
  getWaitlist,
  approveWaitlistUser,
  bulkApproveWaitlistUsers,
} from "../../../api/api-services";

interface WaitlistUser {
  id: number;
  name: string;
  email: string;
  partnerId: number;
  partnerName: string;
  role: string;
  accessCode: string;
  joinedDate: string;
  status: "Pending" | "Approved";
}

interface PartnerOption {
  id: number;
  name: string;
}

const WaitlistPage: React.FC = () => {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  // ---------------- FETCH PARTNERS ----------------
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await getPartners({ active_only: true, skip: 0, limit: 100 });
        if (res?.IsSuccess) {
          setPartners(
            (res.Data as any[]).map((p) => ({ id: p.id, name: p.name }))
          );
        }
      } catch (err: any) {
        toast.error(err?.Message || "Error fetching partners");
      }
    };
    fetchPartners();
  }, []);

  // ---------------- FETCH WAITLIST ----------------
  const fetchWaitlist = async (
    partnerId?: number,
    page: number = 1,
    status?: string
  ) => {
    setLoading(true);
    setTotalCount(0);       // ← reset
    setPendingCount(0);     // ← reset
    setApprovedCount(0);    // ← reset
    setUsers([]);           // ← reset
    try {
      const apiStatus =
        status === "Pending"
          ? "waitlist"
          : status === "Approved"
          ? "active"
          : undefined;

      const res = await getWaitlist({
        partner_id: partnerId,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        status: apiStatus,   // ← this was missing!
      });

      if (res?.IsSuccess) {
        const { users: rawUsers, total, pending_count, approved_count } = res.Data;

        const mapped: WaitlistUser[] = rawUsers.map((u: any) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`.trim(),
          email: u.email,
          partnerId: u.partner_id,
          partnerName: u.partner_name ?? "Direct",
          role: u.role ?? "—",
          accessCode: u.access_code_used ?? "—",
          joinedDate: u.created_at,
          status: u.status === "waitlist" ? "Pending" : "Approved",
        }));

        setUsers(mapped);
        setTotalCount(total ?? 0);
        setPendingCount(pending_count ?? 0);
        setApprovedCount(approved_count ?? 0);
      } else {
        toast.error(res?.Message || "Failed to load waitlist");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Error fetching waitlist");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TRIGGER FETCH ----------------
  useEffect(() => {
    if (partners.length === 0) return;
    const found = partners.find((p) => p.name === sourceFilter);
    fetchWaitlist(found?.id, currentPage, statusFilter);
  }, [sourceFilter, statusFilter, partners, currentPage]);

  // ---------------- FILTER HANDLERS ----------------
  const handleSourceChange = (val: string) => {
    setSourceFilter(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    if (page > Math.ceil(totalCount / PAGE_SIZE)) return;
    setCurrentPage(page);
    setSelectedIds([]);
  };

  // ---------------- SELECTION ----------------
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map((u) => u.id));
  };

  // ---------------- APPROVE SINGLE ----------------
  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await approveWaitlistUser(id);
      if (res?.IsSuccess) {
        toast.success("User approved successfully");
        // refresh current page so counts stay accurate
        const found = partners.find((p) => p.name === sourceFilter);
        fetchWaitlist(found?.id, currentPage, statusFilter);
      } else {
        toast.error(res?.Message || "Failed to approve user");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Something went wrong");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ---------------- BULK APPROVE ----------------
  const handleBulkApprove = async () => {
    setBulkLoading(true);
    try {
      const res = await bulkApproveWaitlistUsers(selectedIds);
      if (res?.IsSuccess) {
        toast.success(res?.Message || "Users approved successfully");
        setSelectedIds([]);
        // refresh current page so counts stay accurate
        const found = partners.find((p) => p.name === sourceFilter);
        fetchWaitlist(found?.id, currentPage, statusFilter);
      } else {
        toast.error(res?.Message || "Bulk approve failed");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Something went wrong");
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-alice-teal text-white rounded-xl shadow-xl shadow-alice-teal/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Waitlist Management</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve new partner registrations.</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total", val: totalCount, color: "bg-alice-teal", icon: Clock, shadow: "shadow-alice-teal/20" },
          { label: "Pending", val: pendingCount, color: "bg-amber-500", icon: LayoutGrid, shadow: "shadow-amber-500/20" },
          { label: "Approved", val: approvedCount, color: "bg-emerald-500", icon: LayoutGrid, shadow: "shadow-emerald-500/20" },
          { label: "Partners", val: partners.length, color: "bg-indigo-500", icon: LayoutGrid, shadow: "shadow-indigo-500/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
            <div className={`p-3 ${stat.color} text-white rounded-xl shadow-lg ${stat.shadow} group-hover:rotate-12 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">

          {/* Source filter */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner Source</span>
            <AliceSelect
              value={sourceFilter}
              onChange={handleSourceChange}
              options={[
                { label: "All Partners", value: "All" },
                ...partners.map((p) => ({ label: p.name, value: p.name })),
              ]}
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
            <div className="flex bg-gray-200/50 p-1 rounded-xl">
              {["All", "Pending", "Approved"].map((f) => (
                <button
                  key={f}
                  onClick={() => handleStatusChange(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === f
                      ? "bg-white text-alice-teal shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mx-auto w-fit mb-8 px-6 py-3.5 bg-emerald-500 rounded-full flex items-center gap-6 animate-in slide-in-from-top-4 duration-300 shadow-2xl shadow-emerald-500/30 ring-4 ring-white/10 sticky top-4 z-20">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">{selectedIds.length}</span>
              </div>
              <span className="text-white text-xs font-semibold tracking-wide">Applicants Selected</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="px-5 py-2 bg-white text-emerald-600 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {bulkLoading ? "Approving..." : "Approve All"}
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-white/80 text-xs font-semibold hover:text-white transition-all"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-8 overflow-x-auto">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading waitlist...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-400 text-sm">No users found.</p>
          ) : (
            <Table>
              <thead>
                <tr className="bg-gray-50/50 border-none">
                  <Th className="w-16 py-5 px-6 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-alice-teal focus:ring-alice-teal cursor-pointer"
                      checked={selectedIds.length === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </Th>
                  <Th className="py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant</Th>
                  <Th className="py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</Th>
                  <Th className="py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</Th>
                  <Th className="py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</Th>
                  <Th className="py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</Th>
                  <Th className="py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right pr-6">Action</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100 last:border-none group">
                    <Td className="py-5 px-6 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-alice-teal focus:ring-alice-teal cursor-pointer"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </Td>

                    <Td className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={user.name} size="40" round="12px" className="shadow-sm ring-2 ring-white" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </Td>

                    <Td className="py-4">
                      <span className="max-w-[180px] truncate px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {user.partnerName}
                      </span>
                    </Td>

                    <Td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold capitalize ${
                        user.role === "staff"
                          ? "bg-indigo-50 text-indigo-600"
                          : user.role === "parent"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role || "—"}
                      </span>
                    </Td>

                    <Td className="py-4">
                      <span className="text-xs text-gray-600">
                        {new Date(user.joinedDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </Td>

                    <Td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1.5 w-fit ${
                        user.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Approved" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                        {user.status}
                      </span>
                    </Td>

                    <Td className="py-4 text-right pr-6">
                      <button
                        disabled={user.status === "Approved" || actionLoadingId === user.id}
                        onClick={() => user.status === "Pending" && handleApprove(user.id)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all ${
                          user.status === "Pending"
                            ? "bg-gray-900 text-white hover:bg-alice-teal shadow-md shadow-black/10 disabled:opacity-50"
                            : "text-gray-400 cursor-default"
                        }`}
                      >
                        {actionLoadingId === user.id ? "..." : user.status === "Pending" ? "Approve" : ""}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-xs text-gray-400">
                Page {currentPage} of {totalPages} — {totalCount} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                {/* Page number buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Always show first, last, current, and neighbours
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-all ${
                          currentPage === item
                            ? "bg-alice-teal text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
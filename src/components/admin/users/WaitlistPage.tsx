import React, { useState } from "react";
import { Clock, LayoutGrid } from "lucide-react";
import { Table, Th, Td } from "../../ui/Table";
import Avatar from "react-avatar";

interface WaitlistUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    source: "NUURI" | "ABC Nursery" | "Direct";
    role: "Parent" | "Staff";
    joinedDate: string;
    status: "Pending" | "Approved";
}

const WaitlistPage: React.FC = () => {
    const [users, setUsers] = useState<WaitlistUser[]>([
        { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", source: "NUURI", role: "Parent", joinedDate: "2024-03-25", status: "Pending" },
        { id: 2, name: "Michael Ross", email: "m.ross@abcnursery.com", source: "ABC Nursery", role: "Staff", joinedDate: "2024-03-26", status: "Pending" },
        { id: 3, name: "Emma Wilson", email: "emma.w@gmail.com", source: "Direct", role: "Parent", joinedDate: "2024-03-27", status: "Pending" },
        { id: 4, name: "James Bond", email: "007@mi6.gov.uk", source: "Direct", role: "Staff", joinedDate: "2024-03-28", status: "Pending" },
    ]);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sourceFilter, setSourceFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("Pending");

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === users.length) setSelectedIds([]);
        else setSelectedIds(users.map(u => u.id));
    };

    const handleApprove = (id: number) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: "Approved" } : u));
    };

    const handleBulkApprove = () => {
        setUsers(users.map(u => selectedIds.includes(u.id) ? { ...u, status: "Approved" } : u));
        setSelectedIds([]);
    };

    const stats = {
        total: users.length,
        nuuri: users.filter(u => u.source === "NUURI").length,
        abc: users.filter(u => u.source === "ABC Nursery").length,
        direct: users.filter(u => u.source === "Direct").length,
    };

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
                    { label: "Total Waiting", val: stats.total, color: "bg-alice-teal", icon: Clock, shadow: "shadow-alice-teal/20" },
                    { label: "From NUURI", val: stats.nuuri, color: "bg-emerald-500", icon: LayoutGrid, shadow: "shadow-emerald-500/20" },
                    { label: "From ABC Nursery", val: stats.abc, color: "bg-indigo-500", icon: LayoutGrid, shadow: "shadow-indigo-500/20" },
                    { label: "Direct Signups", val: stats.direct, color: "bg-rose-500", icon: LayoutGrid, shadow: "shadow-rose-500/20" },
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

            {/* Filters & Table container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner Source</span>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {["All", "NUURI", "ABC Nursery", "Direct"].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setSourceFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sourceFilter === f ? 'bg-white text-alice-teal shadow-md shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                        <div className="flex bg-gray-200/50 p-1 rounded-xl">
                            {["All", "Pending", "Approved"].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${statusFilter === f ? 'bg-white text-alice-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
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
                                className="px-5 py-2 bg-white text-emerald-600 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
                            >
                                Approve All
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
                            {users
                                .filter(u => (sourceFilter === "All" || u.source === sourceFilter) && (statusFilter === "All" || u.status === statusFilter))
                                .map((user) => (
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
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                            user.source === 'NUURI' ? 'bg-emerald-50 text-emerald-600' : 
                                            user.source === 'ABC Nursery' ? 'bg-indigo-50 text-indigo-600' : 
                                            'bg-rose-50 text-rose-600'
                                        }`}>
                                            {user.source}
                                        </span>
                                    </Td>
                                    <Td className="py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase ${
                                            user.role === 'Staff' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </Td>
                                    <Td className="py-4">
                                        <span className="text-xs text-gray-600">{new Date(user.joinedDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </Td>
                                    <Td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1.5 w-fit ${
                                            user.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {user.status}
                                        </span>
                                    </Td>
                                    <Td className="py-4 text-right pr-6">
                                        <button 
                                            onClick={() => user.status === 'Pending' && handleApprove(user.id)}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all ${
                                                user.status === 'Pending' 
                                                ? 'bg-gray-900 text-white hover:bg-alice-teal shadow-md shadow-black/10' 
                                                : 'text-gray-400 cursor-default'
                                            }`}
                                        >
                                            {user.status === 'Pending' ? 'Approve' : 'Done'}
                                        </button>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default WaitlistPage;

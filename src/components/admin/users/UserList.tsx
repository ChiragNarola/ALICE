import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { Users, Search } from "lucide-react";
import { getUserList } from "../../../api/api-services";
import type { DisplayUser } from "../../../routes/models/response/Response";

export default function UserList() {
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [users, setUsers] = useState<DisplayUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const formData = new FormData();
                const response = await getUserList(formData);

                if (response.IsSuccess && response.Data) {
                    const mappedUsers: DisplayUser[] = response.Data.map((u) => ({
                        id: u.id,
                        name: `${u.first_name} ${u.last_name}`,
                        email: u.email,
                        roles: u.roles,
                        role: u.roles.join(", "),
                    }));

                    setUsers(mappedUsers);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };

        fetchUsers();
    }, []);

    // Filtered users based on search and role
    const filteredUsers = users.filter(
        (u) =>
            (u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())) &&
            (selectedRole === "" || u.roles.includes(selectedRole))
    );

    // Local pagination
    const totalRecords = filteredUsers.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(start, start + pageSize);

    // Unique roles for dropdown
    const roleOptions = Array.from(new Set(users.flatMap((u) => u.roles)));

    return (
        <div className="p-6 space-y-6">
            {/* Page Heading */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            User Management
                        </h1>
                        <p className="text-sm text-gray-500">
                            View, search, and manage all users in your system.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Role Filter */}
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col w-72">
                    <label htmlFor="user-search" className="mb-1 text-sm font-medium text-gray-700">
                        Search by keyword
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            id="user-search"
                            type="text"
                            placeholder="Type name or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col w-48">
                    <label htmlFor="role-filter" className="mb-1 text-sm font-medium text-gray-700">
                        Filter by Role
                    </label>
                    <select
                        id="role-filter"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    >
                        <option value="">All Roles</option>
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden border rounded-lg shadow-sm">
                <Table>
                    <thead className="bg-gray-100">
                        <tr>
                            <Th>Sr.No</Th>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user, index) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                                <Td className="font-medium text-gray-900">{user.name}</Td>
                                <Td className="text-gray-600">{user.email}</Td>
                                <Td>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${user.roles.length === 0
                                            ? "bg-red-500 text-white"
                                            : user.roles.includes("parent")
                                                ? "bg-blue-100 text-blue-700"
                                                : user.roles.includes("admin")
                                                    ? "bg-green-100 text-green-700"
                                                    : user.roles.includes("staff")
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {user.roles.length === 0 ? "Unknown" : user.roles.join(", ")}
                                    </span>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalEntries={totalRecords}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}

// ConcernList.tsx
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Table, Th, Td } from "../../../components/ui/Table";
import Pagination from "../../../components/ui/Pagination";
import { Search, ClipboardCheck, Trash2 } from "lucide-react";
import { getConcernsList, deleteConcern, createConcern } from "../../../api/api-services";
import type { ConcernDTO } from "../../../routes/models/response/Response";
import { toast } from 'react-toastify';
import AddConcernModal from "./Addconcern";

export default function ConcernList() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [concerns, setConcerns] = useState<ConcernDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddConcern = async (concern: string) => {
        if (!concern) {
            toast.error("Concern cannot be empty");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("concern", concern);

            const response = await createConcern(formData);
            if (response?.IsSuccess) {
                setConcerns((prev) => [...prev, response.Data]);
                toast.success("Concern added successfully!");
                setIsModalOpen(false);
            } else {
                toast.error(response?.Message || "Failed to add concern.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.Message || "Failed to add concern.");
        }
    };

    const fetchConcerns = async () => {
        try {
            const response = await getConcernsList(new FormData());
            if (response?.IsSuccess && response?.Data) {
                setConcerns(response.Data);
            }
        } catch (err) {
            console.error("Failed to fetch concerns", err);
        }
    };

    useEffect(() => {
        fetchConcerns();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this concern?")) return;

        try {
            const response = await deleteConcern(id);
            console.log(response);
            if (response.IsSuccess) {
                setConcerns((prev) => prev.filter((c) => c.id !== id));
                toast.success("Concern deleted successfully!");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Failed to delete concern.");
        }
    };

    const filteredConcerns = concerns.filter((c) =>
        c.concern.toLowerCase().includes(search.toLowerCase())
    );

    const totalRecords = filteredConcerns.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedConcerns = filteredConcerns.slice(start, start + pageSize);

    return (
        <div className="p-6 space-y-6">
            {/* Page Heading */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <ClipboardCheck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Concern Management</h1>
                        <p className="text-sm text-gray-500">View, search, and manage concerns in your system.</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-wrap items-center gap-4 w-full">
                <div className="flex w-72 flex-col">
                    <label htmlFor="concern-search" className="mb-1 text-sm font-medium text-gray-700">
                        Search by keyword
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            id="concern-search"
                            type="text"
                            placeholder="Type concern..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="ml-auto">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="teal"
                        className="h-10"
                    >
                        + Add Concern
                    </Button>
                </div>
            </div>




            {/* Table */}
            <div className="overflow-hidden border rounded-lg shadow-sm">
                <Table>
                    <thead className="bg-gray-100">
                        <tr>
                            <Th>Sr.No</Th>
                            <Th>Concern</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedConcerns.length === 0 ? (
                            <tr>
                                <Td colSpan={3} className="text-center text-gray-500 py-4">
                                    No concerns found.
                                </Td>
                            </tr>
                        ) : (
                            paginatedConcerns.map((concern, index) => (
                                <tr key={concern.id} className="border-b hover:bg-gray-50 transition">
                                    <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                                    <Td className="font-medium text-gray-900">{concern.concern}</Td>
                                    <Td>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDelete(concern.id)}
                                                title="delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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

            <AddConcernModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddConcern}
            />
        </div>
    );
}

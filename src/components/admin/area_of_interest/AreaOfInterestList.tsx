import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import { Table, Th, Td } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { Search, ClipboardCheck, Laptop2, Trash2 } from "lucide-react";
import { getAreasOfInterestList, deleteAreaOfInterest, createAreaOfInterest } from "../../../api/api-services";
import type { AreaOfInterestDTO } from "../../../routes/models/response/Response";
import { toast } from "react-toastify";
import AddAreaOfInterestModal from "./AddAreaOfInterestModal";

export default function AreaOfInterestList() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [areas, setAreas] = useState<AreaOfInterestDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAreas = async () => {
        try {
            const response = await getAreasOfInterestList(new FormData());
            if (response?.IsSuccess && response?.Data) {
                setAreas(response.Data);
            }
        } catch (err) {
            console.error("Failed to fetch areas of interest", err);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleAddArea = async (area: string) => {
        if (!area) {
            toast.error("Area of Interest cannot be empty");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("interest", area);

            const response = await createAreaOfInterest(formData);
            if (response?.IsSuccess) {
                toast.success("Area of Interest added successfully!");
                setIsModalOpen(false);
                fetchAreas();
            } else {
                toast.error(response?.Message || "Failed to add Area of Interest.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.Message || "Failed to add Area of Interest.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this Area of Interest?")) return;

        try {
            const response = await deleteAreaOfInterest(id);
            if (response?.IsSuccess) {
                toast.success("Area of Interest deleted successfully!");
                fetchAreas();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Failed to delete Area of Interest.");
        }
    };

    const filteredAreas = areas.filter((a) =>
        a.interest.toLowerCase().includes(search.toLowerCase())
    );

    const totalRecords = filteredAreas.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedAreas = filteredAreas.slice(start, start + pageSize);

    return (
        <div className="p-6 space-y-6">
            {/* Page Heading */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Laptop2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Area of Interest Management</h1>
                        <p className="text-sm text-gray-500">View, search, and manage Areas of Interest.</p>
                    </div>
                </div>
            </div>

            {/* Search & Add */}
            <div className="flex flex-wrap items-center gap-4 w-full">
                <div className="flex w-72 flex-col">
                    <label htmlFor="area-search" className="mb-1 text-sm font-medium text-gray-700">
                        Search by keyword
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            id="area-search"
                            type="text"
                            placeholder="Type Area of Interest..."
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
                        + Add Area of Interest
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden border rounded-lg shadow-sm">
                <Table>
                    <thead className="bg-gray-100">
                        <tr>
                            <Th>Sr.No</Th>
                            <Th>Area of Interest</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAreas.length === 0 ? (
                            <tr>
                                <Td colSpan={3} className="text-center text-gray-500 py-4">
                                    {search ? "No Areas of Interest match your search." : "No Areas of Interest found."}
                                </Td>
                            </tr>
                        ) : (
                            paginatedAreas.map((area, index) => (
                                <tr key={area.id} className="border-b hover:bg-gray-50 transition">
                                    <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                                    <Td className="font-medium text-gray-900">{area.interest}</Td>
                                    <Td>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDelete(area.id)}
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

            {/* Add Area Modal */}
            <AddAreaOfInterestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddArea}
            />
        </div>
    );
}
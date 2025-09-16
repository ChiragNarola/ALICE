// AreaOfInterestList.tsx
import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import { Table, Th, Td } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { Search, Laptop2, Trash2 } from "lucide-react";
import {
  getAreasOfInterestList,
  deleteAreaOfInterest,
  createAreaOfInterest,
  countOthers
} from "../../../api/api-services";
import type { AreaOfInterestDTO } from "../../../routes/models/response/Response";
import { toast } from "react-toastify";
import AddAreaOfInterestModal from "./AddAreaOfInterestModal";

export default function AreaOfInterestList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [normalAreas, setNormalAreas] = useState<AreaOfInterestDTO[]>([]);
  const [otherAreas, setOtherAreas] = useState<AreaOfInterestDTO[]>([]);
  const [activeTab, setActiveTab] = useState<"normal" | "other">("normal");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch normal + other areas
  const fetchAreas = async () => {
    try {
      const [normalRes, otherRes] = await Promise.all([
        getAreasOfInterestList(new FormData()),
        countOthers()
      ]);

      const normal: AreaOfInterestDTO[] = normalRes?.IsSuccess && normalRes.Data ? normalRes.Data : [];

      const other: AreaOfInterestDTO[] =
        otherRes?.IsSuccess && otherRes?.Data
          ? (otherRes.Data as any).other_interests
              .filter((c: any) => c.interest.trim() !== "")
              .map((c: any, index: number) => ({
                id: index + 1,
                interest: c.interest,
                count: c.count,
                isOther: true
              }))
          : [];

      setNormalAreas(normal);
      setOtherAreas(other);
    } catch (err) {
      console.error("Failed to fetch areas of interest", err);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Add new area
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
        // Add new area above normal areas
        setNormalAreas((prev) => [response.Data, ...prev]);
        toast.success("Area of Interest added successfully!");
        setIsModalOpen(false);
      } else {
        toast.error(response?.Message || "Failed to add Area of Interest.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.Message || "Failed to add Area of Interest.");
    }
  };

  // Delete normal area
  const handleDelete = async (id: number) => {
    const areaToDelete = normalAreas.find((a) => a.id === id);
    if (!areaToDelete) return;

    if (!confirm("Are you sure you want to delete this Area of Interest?")) return;

    try {
      const response = await deleteAreaOfInterest(id);
      if (response?.IsSuccess) {
        setNormalAreas((prev) => prev.filter((a) => a.id !== id));
        toast.success("Area of Interest deleted successfully!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to delete Area of Interest.");
    }
  };

  // Current tab data
  const currentAreas = activeTab === "normal" ? normalAreas : otherAreas;

  // Filter + paginate
  const filteredAreas = currentAreas.filter((a) =>
    search.trim() === "" ? true : a.interest.toLowerCase().includes(search.toLowerCase())
  );
  const totalRecords = filteredAreas.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedAreas = filteredAreas.slice(start, start + pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
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

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-medium ${
            activeTab === "normal" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500"
          }`}
          onClick={() => { setActiveTab("normal"); setCurrentPage(1); }}
        >
           Interests
        </button>
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-medium ${
            activeTab === "other" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500"
          }`}
          onClick={() => { setActiveTab("other"); setCurrentPage(1); }}
        >
          Other Interests
        </button>
      </div>

      {/* Search + Add */}
      <div className="flex flex-wrap items-center gap-4 w-full mt-4">
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
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>
        {activeTab === "normal" && (
          <div className="ml-auto">
            <Button onClick={() => setIsModalOpen(true)} variant="teal" className="h-10">
              + Add Area of Interest
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table>
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr.No</Th>
              <Th>{activeTab === "normal" ? "User Added Area of interest" : " Other Area of Interest"}</Th>
              <Th>{activeTab === "normal" ? "Actions" : "Count"}</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedAreas.length === 0 ? (
              <tr>
                <Td colSpan={3} className="text-center text-gray-500 py-4">
                  {search ? "No Areas match your search." : "No Areas of Interest found."}
                </Td>
              </tr>
            ) : (
              paginatedAreas.map((area, index) => (
                <tr key={area.id} className="border-b hover:bg-gray-50 transition">
                  <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td className="font-medium text-gray-900">{area.interest}</Td>
                  <Td>
                    {activeTab === "normal" ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(area.id)}
                          title="delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-700">{(area as any).count}</span>
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
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
      />

      {/* Add Area Modal */}
      {activeTab === "normal" && (
        <AddAreaOfInterestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddArea}
        />
      )}
    </div>
  );
}

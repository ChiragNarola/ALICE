// UploadedDocsList.tsx
import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { Search, FileText } from "lucide-react";
import { listDocuments } from "../../api/api-services";
import { toast } from "react-toastify";

export default function UploadedDocsList() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);

  // Fetch documents
  const fetchUploadedDocs = async () => {
    try {
      setLoading(true);
      const response = await listDocuments();
      if (response?.IsSuccess && response.Data) {
        setDocuments(response.Data);
      } else {
        toast.error(response?.Message || "Failed to fetch documents");
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(error?.Message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadedDocs();
  }, []);

  // Filter + paginate
  const filteredDocs = documents.filter((doc) =>
    search.trim() === "" ? true : doc.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecords = filteredDocs.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedDocs = filteredDocs.slice(start, start + pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <div className="flex items-center space-x-3 border-b pb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Documents Management</h1>
          <p className="text-sm text-gray-500">View and search all uploaded documents.</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4 w-full mt-4">
        <div className="flex w-72 flex-col">
          <label htmlFor="doc-search" className="mb-1 text-sm font-medium text-gray-700">
            Search by document name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="doc-search"
              type="text"
              placeholder="Search document..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table>
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr.No</Th>
              <Th>Document Name</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center py-6">
                  <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 px-1">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedDocs.length === 0 ? (
              <tr>
                <Td colSpan={2} className="text-center text-gray-500 py-4">
                  No documents found.
                </Td>
              </tr>
            ) : (
              paginatedDocs.map((doc, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td className="font-medium text-gray-900">{doc}</Td>
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
    </div>
  );
}

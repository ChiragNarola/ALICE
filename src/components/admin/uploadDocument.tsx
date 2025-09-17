// UploadedDocsList.tsx
import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { Search, FileText,Upload } from "lucide-react";
import { listDocuments,  uploadDocuments } from "../../api/api-services";
import { toast } from "react-toastify";
import Tippy from "@tippyjs/react";

export default function UploadedDocsList() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
    const [uploadloading, setUploadLoading] = useState(false);
      const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const allowedExtensions = ["pdf", "docx", "txt", "ppt", "xlsx"];
const MAX_FILE_SIZE_MB = 10;

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

  // ======== File Handling ========
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      setUploadedFile(null);
      setErrorMsg("Invalid file type! Allowed: PDF, DOCX, TXT, PPT, XLSX.");
      toast.error("Invalid file type! Allowed: PDF, DOCX, TXT, PPT, XLSX", { autoClose: 3000 });
      e.target.value = "";
      return;
    }

    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      setUploadedFile(null);
      setErrorMsg(`File too large! Max size ${MAX_FILE_SIZE_MB}MB.`);
      toast.error(`File too large! Max size ${MAX_FILE_SIZE_MB}MB.`, { autoClose: 3000 });
      e.target.value = "";
      return;
    }

    setErrorMsg("");
    setUploadedFile(file);
  };


    const handleSubmitFile = async (file: File | null) => {
      if (!file) {
        setErrorMsg("No file selected!");
        return;
      }
  
      try {
        setUploadLoading(true);
        const response = await uploadDocuments([file]);
  
        if (response.status === "success") {
          toast.success("File uploaded successfully!", { autoClose: 3000 });
          setUploadedFile(null);
        } else {
          toast.error(response.Message || "Failed to upload file", { autoClose: 3000 });
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error?.Message || "An error occurred during upload", { autoClose: 3000 });
      } finally {
        setUploadLoading(false);
      }
    };

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

            {/* File Upload Section - separate card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6 flex flex-col gap-6">
              <div className="flex items-start justify-between">
                {/* Left section - title and description */}
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-xl shadow-sm flex items-center justify-center">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900">Upload File</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Select a file to upload. You can review it before submitting.
                    </p>
                  </div>
                </div>
      
                {/* File selection or upload preview */}
                {!uploadedFile ? (
                  <div className="flex flex-col items-end">
                    <label className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl shadow-sm mt-1 cursor-pointer transition-all">
                      Select File
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt,.ppt,.xlsx"
                        onChange={handleFileSelect}
                      />
                    </label>
      
                    {/* Inline error message */}
                    {errorMsg && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errorMsg}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center w-[42%] gap-3 border border-gray-200 rounded-xl bg-gray-50 p-3">
                    {/* File Info */}
      
      
      
      
      
                    <div className="flex-1 text-center md:text-left">
                      <Tippy content={uploadedFile.name} placement="bottom">
                        <p className="text-sm text-gray-700 font-medium truncate overflow-hidden cursor-default whitespace-nowrap max-w-[180px]">{uploadedFile.name}</p>
                      </Tippy>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
      
                    <div className="flex items-center gap-4">
                      {/* Remove Button */}
                      <button
                        onClick={() => setUploadedFile(null)}
                        className={`px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all ${uploadloading && 'hidden'}`}
                      >
                        Remove
                      </button>
                      {/* Submit Button */}
                      <button
                        onClick={() => handleSubmitFile(uploadedFile)}
                        disabled={loading}
                        className={`px-4 py-2 text-sm text-white rounded-lg transition-all flex items-center justify-center gap-2
          ${uploadloading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
        `}
                      >
                        {uploadloading ? (
                          <div className="flex items-center gap-1">
                            <span>Uploading</span>
                            <span className="flex gap-1 mt-1">
                              <span className="w-1 h-1 bg-gray-100 rounded-full animate-bounce"></span>
                              <span className="w-1 h-1 bg-gray-100 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                              <span className="w-1 h-1 bg-gray-100 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </span>
                          </div>
                        ) : (
                          "Submit"
                        )}
                      </button>
      
                    </div>
                  </div>
                )}
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

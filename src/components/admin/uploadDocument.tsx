// UploadedDocsList.tsx
import { useEffect, useState } from "react";
import { Table, Th, Td } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { Search, FileText, Upload, Check, Trash2 } from "lucide-react";
import { listDocuments, uploadDocuments, listNamespace, deleteDocument } from "../../api/api-services";
import { toast } from "react-toastify";
import Tippy from "@tippyjs/react";
import Button from "../ui/Button";

// Simple Modal component
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex top-[-30px] items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function UploadedDocsList() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [uploadloading, setUploadLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [namespaceError, setNamespaceError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allowedExtensions = ["pdf", "docx", "txt", "xlsx", "pptx"];
  const MAX_FILE_SIZE_MB = 10;

  // Fetch documents
  const fetchUploadedDocs = async () => {
    try {
      setLoading(true);
      const response = await listDocuments();
      console.log("Upload file result ====>", response)
      if (response?.Data) {
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

  // Fetch namespaces
  const fetchNamespaces = async () => {
    try {
      const response = await listNamespace();
      if (response?.IsSuccess && response.Data) {
        setNamespaces(response.Data);
      } else {
        toast.error(response?.Message || "Failed to fetch namespaces");
      }
    } catch (error: any) {
      console.error("Error fetching namespaces:", error);
      toast.error(error?.Message || "Failed to fetch namespaces");
    }
  };

  useEffect(() => {
    fetchUploadedDocs();
    fetchNamespaces();
  }, []);

  // ======== File Handling ========
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      setUploadedFile(null);
      setFileError("Invalid file type! Allowed: PDF, DOCX, TXT, XLSX, PPTX.");
      toast.error("Invalid file type! Allowed: PDF, DOCX, TXT, XLSX, PPTX.", { autoClose: 3000 });
      e.target.value = "";
      return;
    }

    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      setUploadedFile(null);
      setFileError(`File too large! Max size ${MAX_FILE_SIZE_MB}MB.`);
      toast.error(`File too large! Max size ${MAX_FILE_SIZE_MB}MB.`, { autoClose: 3000 });
      e.target.value = "";
      return;
    }

    setFileError("");
    setUploadedFile(file);
  };

  // ======== Submit File ========
  const handleSubmitFile = async () => {
    let valid = true;

    // Reset old errors
    setFileError("");
    setNamespaceError("");

    if (!uploadedFile) {
      setFileError("Please select a file!");
      valid = false;
    }

    if (!selectedNamespace) {
      setNamespaceError("Please select a namespace!");
      valid = false;
    }

    if (!valid) return; // stop if validation fails

    try {
      setUploadLoading(true);
      const response = await uploadDocuments([uploadedFile!], selectedNamespace);
      if (response.data.results[0].status == 'success') {
        toast.success("File uploaded successfully!", { autoClose: 3000 });
        setUploadedFile(null);
        setSelectedNamespace("");
        setModalOpen(false);
        fetchUploadedDocs();
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

  // ======== Delete Document ========
  const handleDelete = async (docName: string) => {
    if (!selectedNamespace) {
      toast.error("Please select a namespace first!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${docName}"?`)) return;

    try {
      setDeleting(true);
      const response = await deleteDocument(docName, selectedNamespace);
      if (response?.IsSuccess) {
        toast.success("Document deleted successfully!", { autoClose: 3000 });
        fetchUploadedDocs();
      } else {
        toast.error(response?.Message || "Failed to delete document", { autoClose: 3000 });
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.Message || "An error occurred while deleting", { autoClose: 3000 });
    } finally {
      setDeleting(false);
    }
  };


  // ======== Filter + Paginate ========
  const filteredDocs = documents.filter((doc) =>
    search.trim() === "" ? true : doc.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecords = filteredDocs.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedDocs = filteredDocs.slice(start, start + pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Heading with New Document button */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Documents Management</h1>
            <p className="text-sm text-gray-500">View and search all uploaded documents.</p>
          </div>
        </div>
      </div>

      {/* Search + Add Document */}
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
        <div className="ml-auto">
          <Button onClick={() => setModalOpen(true)} variant="teal" className="h-10">
            + Add Document
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table>
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr.No</Th>
              <Th>Document Name</Th>
              <Th className="text-center">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6">
                  <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 px-1">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedDocs.length === 0 ? (
              <tr>
                <Td colSpan={3} className="text-center text-gray-500 py-4">
                  No documents found.
                </Td>
              </tr>
            ) : (
              paginatedDocs.map((doc, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td className="font-medium text-gray-900">{doc}</Td>
                  <Td className="text-center">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(doc)}
                      title="delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

      {/* Upload Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4 bg-white rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New Document <span className="text-red-500">*</span>
          </h2>

          {/* File Upload */}
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Select Document <span className="text-red-500">*</span>
            </label>
            {!uploadedFile ? (
              <div className="flex flex-col items-start w-full">
                <label
                  htmlFor="file-upload"
                  className={`flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl shadow-sm cursor-pointer transition-all
                  ${fileError ? "border border-red-500" : ""}`}
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.xlsx,.pptx"
                  onChange={handleFileSelect}
                />
                {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3 border border-gray-200 rounded-xl bg-gray-50 p-3">
                <div className="flex-1">
                  <Tippy content={uploadedFile.name} placement="bottom">
                    <p className="text-sm text-gray-700 font-medium truncate max-w-[220px] cursor-default">
                      {uploadedFile.name}
                    </p>
                  </Tippy>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Namespace Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Namespace <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedNamespace}
              onChange={(e) => {
                setSelectedNamespace(e.target.value);
                setNamespaceError("");
              }}
              disabled={namespaces.length === 0}
              className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50
              ${namespaceError ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">-- Select Namespace --</option>
              {namespaces.map((ns, idx) => (
                <option key={idx} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
            {namespaceError && <p className="mt-1 text-sm text-red-600">{namespaceError}</p>}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitFile}
              disabled={uploadloading}
              className={`px-4 py-2 text-sm text-white rounded-lg transition-all flex items-center gap-2
              ${uploadloading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
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
                <>
                  <Check className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
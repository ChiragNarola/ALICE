import { useEffect, useState } from "react";
import { listHolidays, uploadHolidayFile, deleteHoliday } from "../../api/api-services";
import { toast } from "react-toastify";
import { Table, Th, Td } from "../ui/Table";
import { Search, CalendarDays, Upload, Check, Trash2} from "lucide-react";
import Button from "../ui/Button";
import Tippy from "@tippyjs/react";
import Pagination from "../ui/Pagination";
import type { HolidayItem } from "../../routes/models/response/Response";


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


export default function HolidayList() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [uploadloading, setUploadLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const allowedExtensions = ["csv", "xlsx", "xls"];;
  const MAX_FILE_SIZE_MB = 10;

  const fetchHolidayData = async () => {
    setLoading(true);
    try {
      const res = await listHolidays();
      if (res?.IsSuccess && Array.isArray(res.Data)) {
        const cleaned: HolidayItem[] = res.Data.map((h: any) => ({
          id: h.id,
          title: h.title,
          holiday_date: h.holiday_date,
          end_date: h.end_date ?? null,
        }));
        setHolidays(cleaned);
      } else {
        toast.error(res?.Message || "Failed to load holidays");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidayData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      setUploadedFile(null);
      setFileError("Invalid file type! Allowed: CSV, XLSX, XLS");
      toast.error("Invalid file type! Allowed: CSV, XLSX, XLS", { autoClose: 3000 });
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

  const handleSubmitHolidayPDF = async () => {
    let valid = true;
    setFileError("");

    if (!uploadedFile) {
      setFileError("Please upload a file");
      valid = false;
    }
    if (!valid) return;

    try {
      setUploadLoading(true);
      const response = await uploadHolidayFile(uploadedFile!);

      if (response?.IsSuccess) {
        toast.success("Holiday File uploaded successfully!", {
          autoClose: 3000,
        });
        setUploadedFile(null);
        setModalOpen(false);
        fetchHolidayData();
      } else {
        toast.error(response?.Message || "Failed to upload file", {
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error?.Message || "An error occurred during upload", {
        autoClose: 3000,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredHolidays = holidays.filter((holiday) => {
  const matchesSearch =
        search.trim() === "" ||
        holiday.title.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
    });

  const totalRecords = filteredHolidays.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedHolidays = filteredHolidays.slice(start, start + pageSize);

    const handleDelete = async (id: number) => {
        const holToDelete= holidays.find((h) => h.id===id);
        if (!holToDelete) return;
        if(!confirm("Are you sure to delete this holiday?")) return;
        try{
            const res= await deleteHoliday(id);
            if(res.IsSuccess){
                setHolidays((prev) => prev.filter((h)=> h.id!==id));
                toast.success("Holiday deleted successfully");
            }
        }catch (error:any){
            console.error(error);
            toast.error(error?.message || "Failed to delete holiday");
        }
    };

  return (
    <div className="p-6 space-y-6">
      {/* Heading with New Holiday button */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Holidays Management</h1>
            <p className="text-sm text-gray-500">View holidays</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 w-full mt-4">
        {/* Search */}
        <div className="flex w-72 flex-col">
          <label htmlFor="doc-search" className="mb-1 text-sm font-medium text-gray-700">
            Search by holiday name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="holiday-search"
              type="text"
              placeholder="Search holiday..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Add Document Button */}
        <div className="ml-auto">
            <Button
            onClick={() => setModalOpen(true)}
            variant="teal"
            className="h-10 rounded-lg shadow"
            >
            + Upload Holiday File
            </Button>
        </div>
        </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table>
            <thead className="bg-gray-100">
            <tr>
                <Th>Sr.No</Th>
                <Th>Holiday Title</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
            </tr>
            </thead>

            <tbody>
            {loading ? (
                <tr>
                <td colSpan={4} className="text-center py-6">
                    <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 px-1">Loading...</span>
                    </div>
                </td>
                </tr>
            ) : paginatedHolidays.length === 0 ? (
                <tr>
                <Td colSpan={4} className="text-center text-gray-500 py-4">
                    No holidays found.
                </Td>
                </tr>
            ) : (
                paginatedHolidays.map((holiday, index) => (
                <tr
                    key={holiday.id}
                    className="border-b hover:bg-gray-50 transition"
                >
                    <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                    <Td className="font-medium text-gray-900">{holiday.title}</Td>
                    <Td>{holiday.holiday_date}</Td>
                    <Td>
                        <div className="flex space-x-2">
                        <Button
                            variant="danger"
                            onClick={() => handleDelete(holiday.id)}
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
        

        {/* Upload Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4 bg-white rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New Holiday Calendar <span className="text-red-500">*</span>
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
                  accept=".pdf,.docx,.txt,.xlsx,.pptx,.csv,.xls"
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

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitHolidayPDF}
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

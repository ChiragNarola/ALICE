import { Origami, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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


interface NursariesListItem {
    id: string;
    sr_no: number;
    date: string;
    name: string;
}

export default function NursariesList() {
    const [Nursariess, setNursariess] = useState<NursariesListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [uploading, setUploading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchNursariess();
    }, []);

    const fetchNursariess = async () => {
        setLoading(true);
        //     try {
        //       const { data, error } = await supabase
        //         .from('Nursaries_lists')
        //         .select('*')
        //         .order('sr_no', { ascending: true });

        //       if (error) throw error;
        //       setNursariess(data || []);
        //     } catch (error) {
        //       console.error('Error fetching Nursariess:', error);
        //     } finally {
        //       setLoading(false);
        //     }
    };

    const handleNursaryCreate = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isPDF = file.type === 'application/pdf';
        const isExcel =
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel';

        if (!isPDF && !isExcel) {
            alert('Please upload a PDF or Excel file');
            return;
        }

        setUploading(true);
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = `Nursariess/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('Nursaries-lists')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('Nursaries-lists')
                .getPublicUrl(filePath);

            await supabase
                .from('Nursaries_lists')
                .insert({
                    file_name: file.name,
                    file_url: publicUrl,
                    namespace: 'General',
                });

            fetchNursariess();
            alert('Nursaries list uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const totalPages = Math.ceil(Nursariess.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentNursariess = Nursariess.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };


    return (
        //     <div className="p-6 space-y-6">
        //       {/* Heading with New Document button */}
        //       <div className="flex items-center justify-between border-b pb-4">
        //         <div className="flex items-center space-x-3">
        //           <div className="p-2 bg-indigo-100 rounded-lg">
        //             <CalendarDays className="text-indigo-600" size={24} />
        //           </div>
        //           <div>
        //             <h1 className="text-2xl font-semibold text-gray-800">Nursariess Management</h1>
        //             <p className="text-sm text-gray-500">View and upload Nursaries calendar here.</p>
        //           </div>
        //         </div>
        //       </div>
        //  <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        //         <Table>
        //           <thead className="bg-gray-100">
        //             <tr>

        //               <Th>Sr.No</Th>
        //               <Th>Date</Th>
        //               <Th>Nursaries</Th>
        //             </tr>
        //           </thead>

        //           <tbody>
        //             {loading ? (
        //               <tr>
        //                 <td colSpan={3} className="text-center py-6">
        //                   <div className="flex justify-center items-center py-6">
        //                     <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
        //                     <span className="text-gray-600 px-1">Loading...</span>
        //                   </div>
        //                 </td>
        //               </tr>
        //             ) : NursariesList.length === 0 ? (
        //               <tr>
        //                 <Td colSpan={3} className="text-center text-gray-500 py-4">
        //                   No Nursariess found for this year.
        //                 </Td>
        //               </tr>
        //             ) : (
        //               NursariesList.map((doc, index) => (
        //                 <tr key={doc.id} className="border-b hover:bg-gray-50 transition">

        //                 </tr>
        //               ))
        //             )}
        //           </tbody>
        //         </Table>
        //       </div>

        //     </div>
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Origami className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Nursaries</h1>
                        <p className="text-sm text-gray-600">View and manage Nursaries.</p>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    {/* <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : '+ Add Nursary'}
                    </button> */}
                    <div className="ml-auto">
                        <Button
                            onClick={() => setModalOpen(true)}
                            variant="teal"
                            className="h-10 rounded-lg shadow"
                        >
                            + Add Nursary
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4">
                                    <input type="checkbox" className="rounded" />
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    SR.NO
                                </th>

                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Nursaries
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : currentNursariess.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                        No Nursaries lists found. Upload your first one!
                                    </td>
                                </tr>
                            ) : (
                                currentNursariess.map((Nursaries) => (
                                    <tr key={Nursaries.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{Nursaries.sr_no}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700"> {Nursaries.name}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, Nursariess.length)} of{' '}
                        {Nursariess.length} entries
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => goToPage(pageNum)}
                                    className={`px-3 py-1 border rounded ${currentPage === pageNum
                                        ? 'bg-teal-700 text-white border-teal-700'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {totalPages > 5 && (
                            <>
                                <span className="px-2">...</span>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    className={`px-3 py-1 border rounded ${currentPage === totalPages
                                        ? 'bg-teal-700 text-white border-teal-700'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded bg-white"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <Modal title="Add New Area of Interest" onClose={onClose}>
                <form className="flex flex-col space-y-2" onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="areaOfInterest" className="mb-1 text-sm font-medium text-gray-700">
                        Area of Interest Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="areaOfInterest"
                        type="text"
                        placeholder="Enter Area of Interest..."
                        {...register("areaOfInterest", { required: "Area of Interest title is required" })}
                        className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${errors.areaOfInterest ? "border-red-500" : "border-gray-300"}`
                        }
                    />


                    <div className="flex justify-end space-x-2 mt-2">
                        <button
                            type="button"
                            onClick={() => { reset(); onClose(); }}
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Submitting...
                                </div>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Submit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>

    );
}
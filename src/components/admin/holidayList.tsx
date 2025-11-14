import { CalendarDays, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HolidayListItem {
    id: string;
    sr_no: number;
    date: string;
    name: string;
}

export default function HolidayList() {
    const [holidays, setHolidays] = useState<HolidayListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        setLoading(true);
        //     try {
        //       const { data, error } = await supabase
        //         .from('holiday_lists')
        //         .select('*')
        //         .order('sr_no', { ascending: true });

        //       if (error) throw error;
        //       setHolidays(data || []);
        //     } catch (error) {
        //       console.error('Error fetching holidays:', error);
        //     } finally {
        //       setLoading(false);
        //     }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            const filePath = `holidays/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('holiday-lists')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('holiday-lists')
                .getPublicUrl(filePath);

            await supabase
                .from('holiday_lists')
                .insert({
                    file_name: file.name,
                    file_url: publicUrl,
                    namespace: 'General',
                });

            fetchHolidays();
            alert('Holiday list uploaded successfully!');
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

    const totalPages = Math.ceil(holidays.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentHolidays = holidays.slice(startIndex, endIndex);

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
        //             <h1 className="text-2xl font-semibold text-gray-800">Holidays Management</h1>
        //             <p className="text-sm text-gray-500">View and upload Holiday calendar here.</p>
        //           </div>
        //         </div>
        //       </div>
        //  <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        //         <Table>
        //           <thead className="bg-gray-100">
        //             <tr>

        //               <Th>Sr.No</Th>
        //               <Th>Date</Th>
        //               <Th>Holiday</Th>
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
        //             ) : holidayList.length === 0 ? (
        //               <tr>
        //                 <Td colSpan={3} className="text-center text-gray-500 py-4">
        //                   No Holidays found for this year.
        //                 </Td>
        //               </tr>
        //             ) : (
        //               holidayList.map((doc, index) => (
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
                        <CalendarDays className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Holiday Calendar</h1>
                        <p className="text-sm text-gray-600">View and manage holiday lists.</p>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : '+ Add Document'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
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
                                    Date
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Holiday
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
                            ) : currentHolidays.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                        No holiday lists found. Upload your first one!
                                    </td>
                                </tr>
                            ) : (
                                currentHolidays.map((holiday) => (
                                    <tr key={holiday.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{holiday.sr_no}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{holiday.date}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700"> {holiday.name}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, holidays.length)} of{' '}
                        {holidays.length} entries
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
        </div>

    );
}
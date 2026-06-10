import { type NotificationDto } from "../../../routes/models/response/Response";
import { Table, Td, Th } from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
interface Prop {
    notifications: NotificationDto[];
    loading: boolean;
}
export const NotificationList = ({ loading, notifications }: Prop) => {

    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRecords = notifications.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedNotifications = notifications.slice(start, start + pageSize);

    return (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-200 p-6 md:p-10 shadow-2xl shadow-alice-teal/5">
            <div className="flex items-center justify-between mb-8 md:mb-10">
                <h3 className="text-lg md:text-2xl font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-alice-teal rounded-full" />
                    Past Notifications
                </h3>
            </div>
            <div className="overflow-x-auto bg-gray-50/30 rounded-2xl border border-gray-100">
                <Table>
                    <thead>
                        <tr className="bg-gray-100/50 border-none">
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sr.No</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Body</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Group</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto-ask</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</Th>
                            <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent Date</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-6">
                                    <div className="flex justify-center items-center py-6">
                                        <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                                        <span className="text-gray-600 px-1">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedNotifications.length === 0 ? (
                            <tr>
                                <Td colSpan={6} className="text-center text-gray-500 py-4">
                                    No notifications found.
                                </Td>
                            </tr>
                        ) : (
                            paginatedNotifications.map((notification, index) => (
                                <tr
                                    key={notification.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                                    <Td>{notification.title}</Td>
                                    <Td>{notification.body}</Td>
                                    <Td>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${notification.target_type.includes('all') ? "bg-teal-100 text-teal-700"
                                                : notification.target_type.includes('parent') ? "bg-blue-100 text-blue-700"
                                                    : "bg-yellow-100 text-yellow-700"}`}>
                                            {notification.target_type}
                                        </span>
                                    </Td>
                                    <Td>{notification.question ?? <span className="text-gray-300">—</span>}</Td>
                                    <Td>
                                    {!notification.is_editable
                                        ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">Yes</span>
                                        : <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">No</span>
                                    }
                                    </Td>
                                    <Td>{notification.is_sent && <BadgeCheck />}</Td>
                                    <Td>
                                    {notification.sent_at
                                        ? new Date(notification.sent_at).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : <span className="text-gray-300">—</span>}
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalEntries={totalRecords}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
            </div>
        </div>
    );
}

export default NotificationList;
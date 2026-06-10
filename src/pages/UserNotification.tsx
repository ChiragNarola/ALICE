import { useEffect, useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { getUserNotifications } from "../api/api-services";
import type { NotificationDto } from "../routes/models/response/Response";
import Pagination from "../components/ui/Pagination";

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isYesterday = (dateStr: string) => {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

// const isDayBefore = (dateStr: string) => {
//   const d = new Date(dateStr);
//   const dayBefore = new Date();
//   dayBefore.setDate(dayBefore.getDate() - 2);
//   return d.toDateString() === dayBefore.toDateString();
// };

const getGroupLabel = (dateStr?: string): string => {
  if (!dateStr) return "Earlier";

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    console.log("Invalid date:", dateStr);
    return "Earlier";
  }

  if (isToday(dateStr)) return "Today";
  if (isYesterday(dateStr)) return "Yesterday";

  return "Earlier";
};

export default function UserNotificationList() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getUserNotifications();
        if (res.IsSuccess && res.Data) {
          setNotifications(res.Data);
          setCurrentPage(1);
        } else {
          toast.error(res.Message || "Failed to load notifications");
        }
      } catch (error: any) {
        toast.error(error?.Message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalRecords = notifications.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedNotifications = notifications.slice(start, start + pageSize);

  // Group paginated notifications
  const grouped = paginatedNotifications.reduce((acc: Record<string, NotificationDto[]>, n) => {
  const label = getGroupLabel(n.sent_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
    }, {});

    // Preserve order: Today → Yesterday → Day before → Earlier
  const groupOrder = ["Today", "Yesterday", ...Object.keys(grouped).filter(k => !["Today", "Yesterday", "Earlier"].includes(k)), "Earlier"];
  const orderedGroups = groupOrder.filter(k => grouped[k]);

  const allTodayCount = notifications.filter((n) => n.sent_at && isToday(n.sent_at)).length;

  const NotifCard = ({ n }: { n: NotificationDto }) => (
    <div className="flex gap-3 px-3 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-default mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-alice-teal/10 flex items-center justify-center mt-0.5">
        <Bell className="w-3.5 h-3.5 text-alice-teal" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-alice-black leading-snug">{n.title}</p>
        <p className="text-sm text-alice-darkgray leading-snug mt-0.5 mb-2">{n.body}</p>
        <div className="flex items-center gap-2.5">
          {n.sent_at && (
            <span className="inline-flex items-center gap-1 text-[11px] text-alice-darkgray">
              <Clock className="w-3 h-3" />
              {formatTime(n.sent_at)} · {formatDate(n.sent_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-alice-darkgray">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="p-4 bg-gray-100 rounded-full">
          <BellOff className="w-7 h-7 text-gray-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-alice-black">No notifications yet</p>
          <p className="text-sm text-alice-darkgray mt-1">
            Updates from your nursery will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 sm:py-8 h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-alice-gray pb-4">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-xl font-bold text-alice-black">Notifications</h1>
            <p className="text-sm text-alice-darkgray">{totalRecords} total</p>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — feed (takes 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-1 bg-[#F5F5F0] rounded-2xl p-4">

          {orderedGroups.map((label) => (
            <div key={label}>
                <p className="text-[10px] font-bold tracking-widest text-alice-darkgray uppercase px-1 pt-4 pb-2 first:pt-1">
                {label}
                </p>
                <div className="flex flex-col gap-3">
                {grouped[label].map((n) => (
                  <NotifCard key={n.id} n={n} />
                ))}
              </div>
            </div>
            ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalEntries={totalRecords}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                />
            </div>
          )}
        </div>

        {/* RIGHT — summary panel (takes 1/3) */}
        <div className="flex flex-col gap-4">

          {/* Stats */}
          <div className="bg-white border border-alice-gray rounded-2xl p-5">
            <p className="text-sm font-semibold text-alice-black mb-4">Overview</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F5F5F0] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-alice-teal">{totalRecords}</p>
                <p className="text-xs text-alice-darkgray mt-0.5">Total</p>
              </div>
              <div className="bg-[#F5F5F0] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-alice-teal">{allTodayCount}</p>
                <p className="text-xs text-alice-darkgray mt-0.5">Today</p>
              </div>
            </div>
          </div>

          {/* Most recent */}
          {notifications[0] && (
            <div className="bg-white border border-alice-gray rounded-2xl p-5">
              <p className="text-sm font-semibold text-alice-black mb-3">Latest</p>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-alice-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5 text-alice-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-alice-black">{notifications[0].title}</p>
                  <p className="text-xs text-alice-darkgray mt-0.5 leading-relaxed">{notifications[0].body}</p>
                  {notifications[0].sent_at && (
                    <p className="text-[11px] text-alice-darkgray mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(notifications[0].sent_at)} · {formatDate(notifications[0].sent_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-alice-teal/5 border border-alice-teal/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-alice-teal" />
              <p className="text-sm font-semibold text-alice-black">Stay updated</p>
            </div>
            <p className="text-xs text-alice-darkgray leading-relaxed">
              Notifications are sent by your nursery. Enable push notifications on your device to receive them instantly.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { DateRangePicker } from "../../components/ui/date-range-picker";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
} from "lucide-react";
import {
  getNewSignUps,
  getCostEstimate,
  getFeedbackRatings,
  getTotalChats,
} from "../../api/api-services";
import type {
  DateParams,
  FeedbackRatingDTO,
  CostEstimateDTO,
} from "../../routes/models/request/AdminRequest";

const AdminDashboard = () => {
const today = new Date();
  const currentYear = today.getFullYear();

  // Format as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState<DateParams>({
    start_date: `${currentYear}-01-01`, // First day of the year
    end_date: formatDate(today),        // Current date
  });

  useEffect(() => {
    console.log("Date range initialized:", dateRange);
  }, [dateRange]);;

  const [stats, setStats] = useState<{
    users: number;
    chats: number;
    revenue: number;
    signups: number;
    feedback: FeedbackRatingDTO[];
    cost: CostEstimateDTO[];
  }>({
    users: 0,
    chats: 0,
    revenue: 0,
    signups: 0,
    feedback: [],
    cost: [],
  });

const fetchData = async () => {
  try {
    const [signUps, costEstimate, feedbackRatings, totalChats] =
      await Promise.all([
        getNewSignUps(dateRange),
        getCostEstimate(dateRange),
        getFeedbackRatings(dateRange),
        getTotalChats(dateRange),
      ]);

    const totalRevenue = costEstimate?.Data
      ? costEstimate.Data.reduce(
          (sum: number, item: any) => sum + (item.cost ?? 0),
          0
        )
      : 0;

    setStats({
      users: signUps?.Data?.length ?? 0,
      signups: signUps?.Data?.length ?? 0,
      chats: (totalChats?.Data as unknown as number) ?? 0,
      revenue: totalRevenue,
      feedback: feedbackRatings?.Data
        ? feedbackRatings.Data.map((f: any) => ({
            label: f.label.toUpperCase() as FeedbackRatingDTO["label"],
            count: f.count,
          }))
        : [],
      cost: costEstimate?.Data ?? [], // keep raw cost breakdown
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};


  useEffect(() => {
    fetchData();
  }, []);

  return (
<div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
  {/* Header + Date Filter */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 pb-6">
    {/* Title */}
    <div className="flex items-center space-x-3">
      <div className="p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl shadow-sm">
        <LayoutDashboard className="w-7 h-7 text-teal-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitor usage, performance, and costs with real-time insights.
        </p>
      </div>
    </div>

    {/* Date Filter */}
    <div className="flex items-center gap-2.5 w-full md:w-auto">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
      <Button
        onClick={fetchData}
        className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
      >
        Apply
      </Button>
    </div>
  </div>

  {/* Top Stats */}
  <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
    <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"></span>
      Key Metrics
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { label: "Total Users", value: stats.users, color: "text-gray-800" },
        { label: "New Signups", value: stats.signups, color: "text-teal-600" },
        { label: "Total Chats", value: stats.chats, color: "text-indigo-600" },
        {
          label: "Revenue (Est.)",
          value: `€${stats.revenue.toFixed(2)}`,
          color: "text-green-600",
        },
      ].map((stat, idx) => (
        <Card
          key={idx}
          className="bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl"
        >
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>

  {/* Feedback Ratings Chart */}
  <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"></span>
      Feedback Ratings
    </h3>

    {stats.feedback.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={stats.feedback}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              cornerRadius={6}
              labelLine={false}
              label={({ percent }) => `${(percent as number * 100).toFixed(0)}%`}
            >
              {stats.feedback.map((entry, index) => {
                const label = entry.label?.trim().toLowerCase();

                const colorMap: Record<string, string> = {
                  green: "#10B981",
                  amber: "#F59E0B",
                  red: "#EF4444",
                  blue: "#3B82F6",
                  teal: "#14B8A6",
                  gray: "#6B7280",
                };

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorMap[label || ""] || "#9CA3AF"}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              })}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} responses`, name]}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className="flex justify-center gap-5 mt-5 flex-wrap">
          {stats.feedback.map((item, idx) => {
            const label = item.label?.trim().toLowerCase();
            const colorMap: Record<string, string> = {
              green: "bg-emerald-500",
              amber: "bg-amber-500",
              red: "bg-red-500",
              blue: "bg-blue-500",
              teal: "bg-teal-500",
              gray: "bg-gray-500",
            };
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    colorMap[label || ""] || "bg-gray-400"
                  }`}
                />
                <span className="text-xs text-gray-700">
                  {item.label} ({item.count})
                </span>
              </div>
            );
          })}
        </div>
      </>
    ) : (
      <p className="text-gray-500 text-sm">No feedback data available</p>
    )}
  </div>

  {/* Cost Breakdown */}
  <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full animate-pulse"></span>
      AI Cost Breakdown
    </h3>

    {stats.cost && stats.cost.length > 0 ? (
      <div className="space-y-5">
        {stats.cost.map((item: any, idx: number) => {
          const maxTokens = Math.max(
            ...stats.cost.map((c: any) => parseInt(c["total tokens"]))
          );
          const usagePercent =
            (parseInt(item["total tokens"]) / maxTokens) * 100;

          return (
            <div
              key={idx}
              className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Model & Cost */}
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  {item.model_name}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  €{item.cost.toFixed(2)}
                </span>
              </div>

              {/* Tokens & Percentage */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                <span>Total Tokens</span>
                <span className="font-medium text-gray-700">
                  {item["total tokens"].toLocaleString()} ({usagePercent.toFixed(1)}%)
                </span>
              </div>

              {/* Token Progress Bar */}
              <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ease-in-out ${
                    usagePercent < 50
                      ? "bg-gradient-to-r from-teal-500 to-emerald-400"
                      : usagePercent < 80
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-gradient-to-r from-rose-500 to-red-600"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>

              {/* Helper Text */}
              <p className="mt-1.5 text-xs text-gray-500">
                {usagePercent < 50
                  ? "Low usage compared to other models."
                  : usagePercent < 80
                  ? "Moderate usage — keep an eye on this model."
                  : "High usage — this model is driving most of your costs."}
              </p>
            </div>
          );
        })}

        {/* Legend / Note */}
        <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
          <p>
            This chart shows each model’s token consumption relative to the
            highest usage model in the selected date range.
          </p>
        </div>
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No cost data available</p>
    )}
  </div>
</div>

  );
};

export default AdminDashboard;

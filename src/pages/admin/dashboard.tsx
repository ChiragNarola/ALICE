import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { DateRangePicker } from "../../components/ui/date-range-picker";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageCircle,
  Euro,
  Upload
} from "lucide-react";
import {
  getNewSignUps,
  getCostEstimate,
  getFeedbackRatings,
  getTotalChats,
  getDailyUserRegistration,
  getUserRolesCount,
  getTopCategories,
  getAverageSessionLength,
  getHourlyActivityTrend,
} from "../../api/api-services";
import type {
  DateParams,
  FeedbackRatingDTO,
  CostEstimateDTO,
} from "../../routes/models/request/AdminRequest";

type CountUpNumberProps = { end: number; duration?: number };

const CountUpNumber = ({ end, duration = 1 }: CountUpNumberProps) => {
  const [value, setValue] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);



  useEffect(() => {
    const startValue = 0;
    const targetValue = isNaN(end) ? 0 : end;
    const totalMs = Math.max(0.001, duration) * 1000;

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / totalMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (targetValue - startValue) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };

    setValue(0);
    startTimeRef.current = null;
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <span>{value.toLocaleString()}</span>;
};

type DailyRegistrationDTO = {
  date: string;
  new_registrations: number;
};

type UserRolesDTO = {
  all_user: any;
  parent: number;
  staff: number;
  admin: number;
};

type TopCategoryDTO = {
  percentage: number;
  category: string;
  count: number;
};

type HourlyTrendDTO = {
  time_label: string;
  message_count: number;
};

const AdminDashboard = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState<DateParams>({
    start_date: `${currentYear}-01-01`,
    end_date: formatDate(today),
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dailyRegistration, setDailyRegistration] = useState<DailyRegistrationDTO[]>([]);
  const [userRoles, setUserRoles] = useState<UserRolesDTO>({ parent: 0, staff: 0, admin: 0, all_user: 0 });
  const [topCategories, setTopCategories] = useState<TopCategoryDTO[]>([]);
  const [averageSession, setAverageSession] = useState<any>({});
  const [hourlyTrend, setHourlyTrend] = useState<HourlyTrendDTO[]>([]);
  const [loadingCharts, setLoadingCharts] = useState<boolean>(true);
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
      setLoadingCharts(true);
      const dateParams = {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };
      const [
        signUps,
        costEstimate,
        feedbackRatings,
        totalChats,
        dailyRes,
        rolesRes,
        topCatRes,
        avgSessionRes,
        hourlyRes,
      ] = await Promise.all([
        getNewSignUps(dateRange),
        getCostEstimate(dateRange),
        getFeedbackRatings(dateRange),
        getTotalChats(dateRange),
        getDailyUserRegistration(dateParams),
        getUserRolesCount(),
        getTopCategories(),
        getAverageSessionLength(),
        getHourlyActivityTrend(dateParams),
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
        cost: costEstimate?.Data ?? [],
      });
      setDailyRegistration(dailyRes?.Data || []);
      setUserRoles(rolesRes?.Data || { parent: 0, staff: 0, admin: 0 });
      setTopCategories(topCatRes?.Data || []);
      setAverageSession(avgSessionRes?.Data || {});
      setHourlyTrend(hourlyRes?.Data?.hourly_data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingCharts(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const deriveCostParts = (items: any[]) => {
    let input = 0;
    let output = 0;
    let hasExplicit = false;
    for (const item of items || []) {
      const inputLike =
        typeof item.input_cost === "number"
          ? item.input_cost
          : typeof item.prompt_cost === "number"
            ? item.prompt_cost
            : null;
      const outputLike =
        typeof item.output_cost === "number"
          ? item.output_cost
          : typeof item.completion_cost === "number"
            ? item.completion_cost
            : null;
      if (inputLike !== null) {
        input += inputLike;
        hasExplicit = true;
      }
      if (outputLike !== null) {
        output += outputLike;
        hasExplicit = true;
      }
      const promptTokens = Number(item.prompt_tokens ?? item["prompt tokens"]);
      const completionTokens = Number(item.completion_tokens ?? item["completion tokens"]);
      if (!hasExplicit && !Number.isNaN(promptTokens) && !Number.isNaN(completionTokens)) {
        const totalTokens = promptTokens + completionTokens;
        if (totalTokens > 0 && typeof item.cost === "number") {
          input += (promptTokens / totalTokens) * item.cost;
          output += (completionTokens / totalTokens) * item.cost;
        }
      }
    }
    return { input, output };
  };
  return (
    // <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header + Date Filter */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 pb-6">
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
  <div className="flex items-center gap-2.5 w-full md:w-auto mt-4 md:mt-0">
    <DateRangePicker value={dateRange} onChange={setDateRange} />
    <Button
      onClick={fetchData}
      className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
    >
      Apply
    </Button>
  </div>
</div>

{/* File Upload Section - separate card */}
{/* File Upload Section - styled like dashboard card */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6 flex flex-col md:flex-row md:items-center gap-6">
  {/* Left: Title & Description */}
  <div className="flex items-start space-x-3 md:flex-1">
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

  {/* Right: Upload Button & Preview */}
  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:flex-1 w-full">
    <label className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl shadow-sm cursor-pointer transition-all">
      Select File
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            setUploadedFile(e.target.files[0]);
          }
        }}
      />
    </label>

    {/* File Preview */}
    {uploadedFile && (
      <div className="mt-3 md:mt-0 p-3 border border-gray-200 rounded-xl bg-gray-50 flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-medium">{uploadedFile.name}</p>
          <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
        </div>
        <Button
          onClick={() => setUploadedFile(null)}
          className="text-sm text-red-500 hover:underline px-2 py-1 bg-transparent shadow-none"
        >
          Remove
        </Button>
      </div>
    )}
  </div>
</div>



      {/* Top Stats - simplified cards without heading */}
      {/* <div className="bg-white rounded-2xl shadow p-5 border border-gray-100"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Users",
            value: stats.users ?? 0,
            color: "text-gray-900",
            iconBg: "from-slate-100 to-gray-50",
            iconRing: "ring-gray-200",
            Icon: Users,
            details: ["Active users", "Verified accounts"],
          },
          {
            label: "New Signups",
            value: stats.signups ?? 0,
            color: "text-teal-700",
            iconBg: "from-teal-100 to-emerald-50",
            iconRing: "ring-teal-200",
            Icon: UserPlus,
            details: ["Mobile app", "Web portal"],
          },
          {
            label: "Total Chats",
            value: stats.chats ?? 0,
            color: "text-indigo-700",
            iconBg: "from-indigo-100 to-blue-50",
            iconRing: "ring-indigo-200",
            Icon: MessageCircle,
            details: ["Open chats", "Closed chats"],
          },
          {
            label: "Estimated Cost",
            value: stats.revenue ?? 0,
            color: "text-emerald-700",
            iconBg: "from-emerald-100 to-green-50",
            iconRing: "ring-emerald-200",
            Icon: Euro,
          },
        ].map(({ label, value, color, iconBg, iconRing, Icon, details }, idx) => (
          <Card
            key={idx}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all min-h-[200px]"
          >
            <CardContent className="p-5 flex flex-col h-full justify-between">
              {label === "Estimated Cost" ? (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-3xl font-extrabold ${color}`}>
                        €
                        {stats?.cost
                          ? stats.cost.reduce((s: number, c: { cost?: number }) => s + (c.cost ?? 0), 0).toFixed(2)
                          : "0.00"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconBg} ring-1 ${iconRing} shadow-sm`}>
                      <Icon className="w-5 h-5 text-gray-700/80" />
                    </div>
                  </div>

                  {stats?.cost && (() => {
                    const parts = deriveCostParts(stats.cost);
                    return (
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Input cost</span>
                          <span className="font-semibold text-gray-900">€{parts.input.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Output cost</span>
                          <span className="font-semibold text-gray-900">€{parts.output.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className={`text-3xl sm:text-4xl font-extrabold ${color}`}>
                        {typeof value === "number" ? <CountUpNumber end={value} duration={1.2} /> : value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBg} ring-1 ${iconRing} shadow-sm`}>
                      <Icon className="w-5 h-5 text-gray-700/80" />
                    </div>
                  </div>

                  {/* Short meaningful filler sentences */}
                  {details && (
                    <div className="mt-4 space-y-1 text-xs text-gray-400">
                      {details.map((d, i) => (
                        <div key={i}>{d}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* </div> */}

      {/* Feedback Ratings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Feedback Ratings</h3>
                <p className="text-xs text-gray-500">Distribution of user responses</p>
              </div>
            </div>
          </div>

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
                        like: "#10B981",
                        neutral: "#F59E0B",
                        dislike: "#EF4444",
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
                    like: "bg-emerald-500",
                    neutral: "bg-amber-500",
                    dislike: "bg-red-500",
                    blue: "bg-blue-500",
                    teal: "bg-teal-500",
                    gray: "bg-gray-500",
                  };
                  return (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 rounded-full ${colorMap[label || ""] || "bg-gray-400"
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-400"></span>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Top 5 Chat Topics</h3>
                <p className="text-xs text-gray-500 mt-1">Most discussed topics</p>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 font-medium text-gray-400 text-xs mb-2">
            <span className="col-span-7">Category</span>
            <span className="col-span-2 text-right">Percentage</span>
            <span className="col-span-3"></span>
          </div>

          {/* Table Rows or Preloader */}
          {loadingCharts ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center py-3">
                  <div className="col-span-7 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="col-span-2 h-3 bg-gray-200 rounded-full animate-pulse ml-auto"></div>
                  <div className="col-span-12 mt-2 h-2 bg-gray-200 rounded-full animate-pulse relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse-slow rounded-full w-2/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            (topCategories || []).slice(0, 5).map((item, idx) => {
              const percent = Number(item.percentage ?? 0);

              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {/* Category Name */}
                  <div className="col-span-7 flex items-center gap-3">
                    <span className="text-gray-700 font-medium text-sm">{item.category}</span>
                  </div>

                  {/* Percentage Text */}
                  <div className="col-span-2 text-right font-semibold text-gray-900 text-sm">{percent}%</div>

                  {/* Progress Bar */}
                  <div className="col-span-12 mt-2 relative h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    ></div>
                    <span
                      className="absolute right-0 top-0 text-xs text-gray-700 font-semibold pr-1"
                      style={{ transform: "translateY(-50%)" }}
                    >
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {/* Footer spacing */}
          <div className="mt-4"></div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Average Session Length*/}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
            <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-400"></span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Average Session Length</h3>
              <p className="text-xs text-gray-400">Distribution of conversation duration</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {loadingCharts ? "..." : `${Math.round(averageSession.average_session_duration / 60)} min`}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Avg messages per session: {averageSession.average_session_messages || 0}
            </p>
          </div>

          {/* Area Chart */}
          <div className="mt-2 h-64 w-full">
            {averageSession.duration_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={averageSession.duration_distribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="avgSessionGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />

                  <XAxis
                    dataKey="duration_range"
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    width={50}
                    label={{
                      value: 'Sessions',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#4b5563',
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [`${value} sessions`, 'Conversation Count']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="conversation_count"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="url(#avgSessionGradient)"
                    activeDot={{ r: 5, fill: '#1E40AF' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center mt-6">
                No session distribution data available
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Note: Monitor session trends to identify peak user engagement hours.
          </p>
        </div>

        {/* Hourly Activity Trend  */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hourly Activity Trend</h3>
                <p className="text-xs text-gray-400">User activity by hour (messages sent)</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Last 24 hours</p>
          </div>

          {/* Chart */}
          <div className="mt-4 h-64 w-full">
            {loadingCharts ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : hourlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrend} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  {/* Subtle Teal Gradient */}
                  <defs>
                    <linearGradient id="hourlyAreaGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />  {/* teal-500 */}
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.15} /> {/* teal-400 */}
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />

                  <XAxis
                    dataKey="time_label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval={2}
                    tickFormatter={(value) => {
                      return value;
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    width={50}
                    label={{
                      value: 'Messages',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#6b7280',
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [`${value} messages`, 'Messages']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="message_count"
                    stroke="#0d9488" // teal-600
                    strokeWidth={2.5}
                    fill="url(#hourlyAreaGradient)"
                    activeDot={{ r: 5, fill: '#0f766e' }} // teal-700
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center mt-6">
                No hourly activity data available
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-3">
            Insights: Peaks indicate the hours when users are most active. Use this to optimize notifications and engagement strategies.
          </p>
        </div>

        {/* Daily Registrations */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Registrations</h3>
                <p className="text-xs text-gray-500">New users registered over time</p>
              </div>
            </div>
            <Users className="w-6 h-6 text-teal-500" />
          </div>

          {loadingCharts ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Loading chart...
            </div>
          ) : dailyRegistration.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyRegistration} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dailyLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.7} /> {/* teal-500 */}
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.2} /> {/* teal-400 */}
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4b5563' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5563' }} />

                <Tooltip
                  formatter={(value) => [`${value} users`, 'Registrations']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="new_registrations"
                  stroke="url(#dailyLine)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0d9488' }}
                  activeDot={{ r: 6, fill: '#0f766e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No daily registration data available</p>
          )}
        </div>

        {/* User Roles  */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-400"></span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Roles</h3>
              <p className="text-xs text-gray-500">Breakdown of users by role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            {[
              { label: "Parents", value: userRoles.parent },
              { label: "Staff", value: userRoles.staff },
              { label: "Total Users", value: userRoles.all_user },
            ].map((role, idx) => {
              const percentage = ((role.value / (userRoles.all_user || 1)) * 100).toFixed(0);
              return (
                <div
                  key={idx}
                  className="relative bg-gray-50 p-5 rounded-xl shadow-sm flex flex-col items-center justify-between"
                >
                  {/* Circular Progress */}
                  <div className="w-20 h-20 relative mb-3">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        className="text-gray-200"
                        strokeWidth="4"
                        fill="none"
                        stroke="currentColor"
                        d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeWidth="4"
                        fill="none"
                        stroke={`url(#roleGrad${idx})`}
                        strokeDasharray={`${percentage}, 100`}
                        strokeLinecap="round"
                        d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <defs>
                        <linearGradient id={`roleGrad${idx}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
                      {percentage}%
                    </div>
                  </div>

                  {/* Labels */}
                  <p className="text-xl font-bold">{role.value}</p>
                  <p className="text-sm text-gray-500">{role.label}</p>

                  {/* Optional static text */}
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {role.label.toLowerCase()} this month.
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

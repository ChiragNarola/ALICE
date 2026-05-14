import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { DateRangePicker } from "../../components/ui/date-range-picker";
import { toast } from "react-toastify";
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
  AreaChart,
  BarChart,
  Bar,
} from "recharts";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageCircle,
  Euro,
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

  generateHeatmap,
  getWaitlistAnalytics,
  getTokenUsageAnalytics,
  getUserRetention,
} from "../../api/api-services";
import type {
  DateParams,
  FeedbackRatingDTO,
  CostEstimateDTO,
  DailyRegistrationDTO,
  UserRolesDTO,
  TopCategoryDTO,
  HourlyTrendDTO,
  WaitlistAnalyticsDTO,
  TokenUsageAnalyticsDTO,
  UserRetentionDTO,
} from "../../routes/models/request/AdminRequest";
import { connectStaffWebSocket } from "../../api/web-socket";
import { useNavigate } from "react-router-dom";

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

const AdminDashboard = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState<DateParams>({
    start_date: `${currentYear}-01-01`,
    end_date: formatDate(today),
  });
  const [loadingCharts, setLoadingCharts] = useState<boolean>(true);
  const [dailyRegistration, setDailyRegistration] = useState<DailyRegistrationDTO[]>([]);
  const [userRoles, setUserRoles] = useState<UserRolesDTO>({ parent: 0, staff: 0, admin: 0, all_user: 0 });
  const [topCategories, setTopCategories] = useState<TopCategoryDTO[]>([]);
  const [averageSession, setAverageSession] = useState<any>({});
  const [hourlyTrend, setHourlyTrend] = useState<HourlyTrendDTO[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loadingHeatmap] = useState<boolean>(false);
  const [loadingApply, setLoadingApply] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "engagement" | "waitlist" | "usage">("overview");
  const [waitlistData, setWaitlistData] = useState<WaitlistAnalyticsDTO | null>(null);
  const [tokenUsageData, setTokenUsageData] = useState<TokenUsageAnalyticsDTO | null>(null);
  const [retentionData, setRetentionData] = useState<UserRetentionDTO | null>(null);

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

  const navigate = useNavigate();

  useEffect(() => {
  if (!(window as any)._staffWSConnected) {
    (window as any)._staffWSConnected = true;

    connectStaffWebSocket((msg: any) => {
      console.log("WS RECEIVED:", msg); 

      if (msg.type === "NEW_STAFF" && msg.target === "admin") {
        toast.info(`🆕 New Staff Registered: ${msg.name}`, {
          autoClose: false,
          closeOnClick: true,
          position: "top-right",
          onClick: () => navigate("/admin/staff-nursery"),
          style: {
            cursor: "pointer",
            borderLeft: "6px solid #059669",
            fontSize: "15px",
            fontWeight: "600"
          }
        });
      }
    });
  }
}, []);

  // ======== Dashboard Fetch ========
  const fetchData = async () => {
    try {
      setLoadingApply(true);
      setLoadingCharts(true);
      const dateParams = { start_date: dateRange.start_date, end_date: dateRange.end_date };

      const results = await Promise.allSettled([
        getNewSignUps(dateRange),
        getCostEstimate(dateRange),
        getFeedbackRatings(dateRange),
        getTotalChats(dateRange),
        getDailyUserRegistration(dateParams),
        getUserRolesCount(),
        getTopCategories(),
        getAverageSessionLength(),
        getHourlyActivityTrend(dateParams),
        generateHeatmap(dateRange.start_date, dateRange.end_date),
        getWaitlistAnalytics(dateRange),
        getTokenUsageAnalytics(dateRange),
        getUserRetention(dateRange),
      ]);

      const [
        signUpsRes,
        costRes,
        feedbackRes,
        chatsRes,
        dailyRes,
        rolesRes,
        topCatRes,
        avgSessionRes,
        hourlyRes,
        heatmapRes,
        waitlistRes,
        tokenUsageRes,
        retentionRes,
      ] = results.map(r => r.status === "fulfilled" ? r.value?.Data ?? [] : []);

      const totalRevenue = costRes?.reduce((sum: number, item: any) => sum + (item.cost ?? 0), 0) || 0;

      setStats({
        users: signUpsRes.length,
        signups: signUpsRes.length,
        chats: Number(chatsRes) || 0,
        revenue: totalRevenue,
        feedback: feedbackRes?.map((f: any) => ({
          label: f.label?.toUpperCase(),
          count: f.count ?? 0
        })) || [],
        cost: costRes || []
      });

      setDailyRegistration(dailyRes || []);
      setUserRoles(rolesRes || { parent: 0, staff: 0, admin: 0, all_user: 0 });
      setTopCategories(topCatRes || []);
      setAverageSession(avgSessionRes || {});
      setHourlyTrend(hourlyRes?.hourly_data || []);
      setHeatmapData(heatmapRes || []);
      setWaitlistData(waitlistRes || null);
      setTokenUsageData(tokenUsageRes || null);
      setRetentionData(retentionRes || null);
    } catch (error) {
      console.error("Unexpected error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data", { autoClose: 3000 });
    } finally {
      setLoadingCharts(false);
      setLoadingApply(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======== Utility: Cost Parts ========
  const deriveCostParts = (items: any[]) => {
    let input = 0;
    let output = 0;
    let hasExplicit = false;

    for (const item of items || []) {
      const inputLike = typeof item.input_cost === "number" ? item.input_cost
        : typeof item.prompt_cost === "number" ? item.prompt_cost : null;
      const outputLike = typeof item.output_cost === "number" ? item.output_cost
        : typeof item.completion_cost === "number" ? item.completion_cost : null;

      if (inputLike !== null) { input += inputLike; hasExplicit = true; }
      if (outputLike !== null) { output += outputLike; hasExplicit = true; }

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
            className="bg-gradient-to-r  from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            {loadingApply ? <div className="w-5 h-5 border-2 mx-[10px] my-[1px] border-white border-t-transparent rounded-full animate-spin" /> : "Apply"}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-2xl w-fit border border-gray-200">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "activity", label: "Activity", icon: Users },
          { id: "engagement", label: "Engagement", icon: MessageCircle },
          { id: "waitlist", label: "Waitlist", icon: UserPlus },
          { id: "usage", label: "Usage", icon: Euro },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
              ? "bg-white text-teal-600 shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-teal-600" : "text-gray-400"}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Top Stats - simplified cards without heading */}
      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Users", value: stats.users ?? 0, color: "text-gray-900", iconBg: "from-slate-100 to-gray-50", iconRing: "ring-gray-200", Icon: Users, details: ["Active users", "Verified accounts"] },
                { label: "New Signups", value: stats.signups ?? 0, color: "text-teal-700", iconBg: "from-teal-100 to-emerald-50", iconRing: "ring-teal-200", Icon: UserPlus, details: ["Mobile app", "Web portal"] },
                { label: "Total Chats", value: stats.chats ?? 0, color: "text-indigo-700", iconBg: "from-indigo-100 to-blue-50", iconRing: "ring-indigo-200", Icon: MessageCircle, details: ["Open chats", "Closed chats"] },
                { label: "Estimated Cost", value: stats.revenue ?? 0, color: "text-emerald-700", iconBg: "from-emerald-100 to-green-50", iconRing: "ring-emerald-200", Icon: Euro },
              ].map(({ label, value, color, iconBg, iconRing, Icon, details }, idx) => (
                <Card key={idx} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all min-h-[200px]">
                  <CardContent className="p-5 flex flex-col h-full justify-between">
                    {label === "Estimated Cost" ? (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`text-3xl font-extrabold ${color}`}>€{stats?.cost ? stats.cost.reduce((s: number, c: { cost?: number }) => s + (c.cost ?? 0), 0).toFixed(2) : "0.00"}</p>
                            <p className="text-xs text-gray-400 mt-1">{label}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconBg} ring-1 ${iconRing} shadow-sm`}><Icon className="w-5 h-5 text-gray-700/80" /></div>
                        </div>
                        {stats?.cost && (() => {
                          const parts = deriveCostParts(stats.cost);
                          return (
                            <div className="mt-3 space-y-1 text-sm">
                              <div className="flex items-center justify-between"><span className="text-gray-600">Input cost</span><span className="font-semibold text-gray-900">€{parts.input.toFixed(2)}</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Output cost</span><span className="font-semibold text-gray-900">€{parts.output.toFixed(2)}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <p className={`text-3xl sm:text-4xl font-extrabold ${color}`}>{typeof value === "number" ? <CountUpNumber end={value} duration={1.2} /> : value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                          </div>
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBg} ring-1 ${iconRing} shadow-sm`}><Icon className="w-5 h-5 text-gray-700/80" /></div>
                        </div>
                        {details && <div className="mt-4 space-y-1 text-xs text-gray-400">{details.map((d, i) => <div key={i}>{d}</div>)}</div>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Registrations */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Daily Registrations</h3>
                      <p className="text-xs text-gray-500">New users registered over time</p>
                    </div>
                  </div>
                  <Users className="w-6 h-6 text-teal-500" />
                </div>
                {loadingCharts ? <div className="w-full h-72 animate-pulse bg-gray-50 rounded-xl" /> : dailyRegistration.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyRegistration} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4b5563' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="new_registrations" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#0d9488' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-500 text-sm">No daily registration data available</p>}
              </div>

              {/* User Roles  */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
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
                      <div key={idx} className="relative bg-gray-50 p-5 rounded-xl shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 relative mb-3">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path className="text-gray-200" strokeWidth="4" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path strokeWidth="4" fill="none" stroke="#3B82F6" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">{percentage}%</div>
                        </div>
                        <p className="text-xl font-bold">{role.value}</p>
                        <p className="text-sm text-gray-500">{role.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Retention Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Retention Rate", value: `${retentionData?.summary?.retention_rate_percent ?? 0}%`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Returning Users", value: retentionData?.summary?.returning_users ?? 0, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Avg. Sessions/User", value: retentionData?.summary?.avg_sessions_per_user?.toFixed(2) ?? 0, icon: MessageCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Total Active Users", value: retentionData?.summary?.total_active_users ?? 0, icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-white border-gray-100 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily Active Users Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500"></span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Daily Active Users (DAU)</h3>
                    <p className="text-xs text-gray-400">Unique users active per day</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 h-80 w-full">
                {retentionData?.daily_active_users?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={retentionData.daily_active_users} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="active_users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#dauGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No DAU data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
                  <h3 className="text-lg font-semibold text-gray-900">Hourly Activity Trend</h3>
                </div>
              </div>
              <div className="mt-4 h-80 w-full">
                {loadingCharts ? <div className="w-full h-full animate-pulse bg-gray-50 rounded-xl" /> : hourlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyTrend} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                      <XAxis dataKey="time_label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="message_count" stroke="#0d9488" fill="#14b8a633" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center mt-6">No hourly activity data available</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-indigo-800 via-indigo-600 to-indigo-500"></span>
                <h3 className="text-lg font-semibold text-gray-900">User Drop-off Heatmap</h3>
              </div>
              <div className="mt-2 h-96 w-full">
                {heatmapData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heatmapData} layout="vertical" margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                      <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis dataKey="screen_name" type="category" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="drop_off_rate" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center mt-6">No heatmap data available</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "engagement" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
                    <h3 className="text-base font-semibold text-gray-900">Feedback Ratings</h3>
                  </div>
                </div>
                {stats.feedback.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={stats.feedback} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} cornerRadius={6} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {stats.feedback.map((entry, index) => <Cell key={index} fill={entry.label?.toLowerCase() === 'like' ? '#10B981' : entry.label?.toLowerCase() === 'neutral' ? '#F59E0B' : '#EF4444'} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-500 text-sm">No feedback data available</p>}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
                  <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-400"></span>
                  <h3 className="text-base font-semibold text-gray-900">Top 5 Chat Topics</h3>
                </div>
                <div className="space-y-4">
                  {(topCategories || []).slice(0, 5).map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm font-medium"><span className="text-gray-700">{item.category}</span><span className="text-gray-900">{item.percentage}%</span></div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${item.percentage}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-400"></span>
                <h3 className="text-lg font-semibold text-gray-900">Average Session Length</h3>
              </div>
              <div className="flex justify-between items-end mb-6">
                <p className="text-3xl font-bold text-gray-900">{averageSession.average_session_duration ? `${Math.round(averageSession.average_session_duration / 60)} min` : "0 min"}</p>
                <p className="text-gray-500 text-sm">Avg messages: {averageSession.average_session_messages || 0}</p>
              </div>
              <div className="h-80 w-full">
                {averageSession.duration_distribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={averageSession.duration_distribution}>
                      <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                      <XAxis dataKey="duration_range" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="conversation_count" stroke="#3B82F6" fill="#3B82F633" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center mt-6">No session distribution data available</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "waitlist" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Waitlist Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Waitlist Size</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {waitlistData?.current_waitlist_size ?? 0}
                      </p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-xl">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Total users waiting for approval</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Approval Time</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {waitlistData?.avg_approval_time_hours ? `${waitlistData.avg_approval_time_hours.toFixed(1)} hrs` : "0 hrs"}
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Average time from signup to approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Approvals Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Approvals</h3>
                  <p className="text-xs text-gray-400">Number of users approved per day</p>
                </div>
              </div>
              <div className="h-80 w-full">
                {waitlistData?.daily_approvals?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waitlistData.daily_approvals} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar dataKey="approvals" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No approval data available for the selected period
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "usage" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Token Usage by Model */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-400"></span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Token Usage by Model</h3>
                  <p className="text-xs text-gray-400">Distribution of input and output tokens per model</p>
                </div>
              </div>
              <div className="h-80 w-full">
                {tokenUsageData?.by_model?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tokenUsageData.by_model} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="model" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f9fafb' }}
                      />
                      <Bar dataKey="input_tokens" name="Input Tokens" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="output_tokens" name="Output Tokens" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No model usage data available
                  </div>
                )}
              </div>
            </div>

            {/* Top 10 Users by Token Usage */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-indigo-500 to-blue-400"></span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Users (Token Consumption)</h3>
                    <p className="text-xs text-gray-400">Users with the highest total token usage</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Input Tokens</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Tokens</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tokenUsageData?.top_users?.length ? (
                      tokenUsageData.top_users.map((user, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{user.name}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                            {user.input_tokens.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                            {user.output_tokens.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 ring-1 ring-teal-600/10">
                              {user.total_tokens.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                          No user usage data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default AdminDashboard;

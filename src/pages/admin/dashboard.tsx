import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { DateRangePicker } from "../../components/ui/date-range-picker";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageCircle,
  Euro
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
        cost: costEstimate?.Data ?? [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const topics = [
    { topic: "AI Assistants", chats: "1.2K" },
    { topic: "Customer Support", chats: "950" },
    { topic: "Billing Issues", chats: "720" },
    { topic: "Product Feedback", chats: "610" },
    { topic: "Technical Help", chats: "530" },
  ];

  // Helpers for Top Topics section
  const toNumberFromCompact = (value: string | number): number => {
    if (typeof value === "number") return value;
    const trimmed = value.trim().toUpperCase();
    if (trimmed.endsWith("K")) return parseFloat(trimmed.replace("K", "")) * 1000;
    if (trimmed.endsWith("M")) return parseFloat(trimmed.replace("M", "")) * 1000000;
    const parsed = parseFloat(trimmed.replace(/[, ]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalTopicChats = topics.reduce((sum, t) => sum + toNumberFromCompact(t.chats), 0);

  // Helpers for Cost section - try to derive input/output if present or estimable
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

      // Fallback: split by token ratio if available
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

      {/* Top Stats - simplified cards without heading */}
      {/* <div className="bg-white rounded-2xl shadow p-5 border border-gray-100"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Users",
            value: stats.users,
            color: "text-gray-900",
            iconBg: "from-slate-100 to-gray-50",
            iconRing: "ring-gray-200",
            Icon: Users,
          },
          {
            label: "New Signups",
            value: stats.signups,
            color: "text-teal-700",
            iconBg: "from-teal-100 to-emerald-50",
            iconRing: "ring-teal-200",
            Icon: UserPlus,
          },
          {
            label: "Total Chats",
            value: `${stats.chats}`,
            color: "text-indigo-700",
            iconBg: "from-indigo-100 to-blue-50",
            iconRing: "ring-indigo-200",
            Icon: MessageCircle,
          },
          {
            label: "Estimated Cost",
            value: `€${stats.revenue.toFixed(2)}`,
            color: "text-emerald-700",
            iconBg: "from-emerald-100 to-green-50",
            iconRing: "ring-emerald-200",
            Icon: Euro,
          },
        ].map(({ label, value, color, iconBg, iconRing, Icon }, idx) => (
          <Card
            key={idx}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {label === "Total Users" ? (
                    <div className="flex flex-col">
                      <p className={`text-4xl font-extrabold ${color}`}>
                        <CountUpNumber end={Number(value) || 0} duration={1.2} />
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                  ) : label === "Estimated Cost" ? (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-3xl font-extrabold ${color}`}>
                            €
                            {stats?.cost
                              ? stats.cost.reduce((s: number, c: { cost?: number }) => s + (c.cost ?? 0), 0).toFixed(2)
                              : "0.00"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">Estimated Cost</p>
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
                    <div>
                      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                      <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                  )}
                </div>
                {label !== "Estimated Cost" && (
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconBg} ring-1 ${iconRing} shadow-sm`}>
                    <Icon className="w-5 h-5 text-gray-700/80" />
                  </div>
                )}
              </div>
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
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-10 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500"></span>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Top 5 Chat Topics</h3>
                <p className="text-xs text-gray-500">Most discussed topics</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="text-sm">
            <div className="grid grid-cols-12 font-medium text-gray-500 mb-2">
              <span className="col-span-7">Topic</span>
              {/* <span className="col-span-3 text-right">Chats</span> */}
              <span className="col-span-2 text-right">Chats</span>
            </div>
            {topics.map((item, idx) => {
              const value = toNumberFromCompact(item.chats);
              const percent = totalTopicChats ? Math.round((value / totalTopicChats) * 100) : 0;
              return (
                <div key={idx} className="grid grid-cols-12 py-2 text-gray-700 text-sm border-b border-gray-50 last:border-0">
                  <div className="col-span-7 flex items-center gap-2">
                    <span>{item.topic}</span>
                  </div>
                  {/* <div className="col-span-3 text-right font-medium">{item.chats}</div> */}
                  <div className="col-span-2 text-right font-medium">{percent}%</div>
                  <div className="col-span-12 mt-1">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
    // </div>

  );
};

export default AdminDashboard;

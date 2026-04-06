import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiActivity, FiBarChart2, FiPieChart, FiTrendingUp } from "react-icons/fi";
import CashFlowSankey from "./CashFlowSankey";

const CHART_COLORS = ["#0EA5E9", "#06B6D4", "#14B8A6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const SUCCESS_COLOR = "#10B981";
const DANGER_COLOR = "#EF4444";

function formatInr(value) {
  return `INR ${Number(value || 0).toLocaleString()}`;
}

function NoDataCard({ title, subtitle }) {
  return (
    <div className="flex min-h-65 items-center justify-center rounded-xl border border-dashed border-slate-400/30 bg-slate-900/20 p-4 text-center">
      <div>
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-400/35 text-lg text-slate-300">
          ∅
        </div>
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-1 text-xs text-slate-300">{subtitle}</p>
      </div>
    </div>
  );
}

const glassTileClass =
  "rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md shadow-[0_18px_36px_rgba(2,8,23,0.35)]";

export default function AnalyticsSection({
  summary,
  categories = [],
  trends = [],
  last7DaysTrends = [],
  records = [],
  currentRole = "VIEWER",
  mode,
  showModeToggle = true,
  showAccessRestricted = false,
}) {
  const [activeTab, setActiveTab] = useState("summary");

  // Check if user can view analytics
  const canViewAnalytics = currentRole === "ANALYST" || currentRole === "ADMIN";
  const requestedTab = mode || activeTab;
  const resolvedTab = canViewAnalytics && requestedTab === "analytics" ? "analytics" : "summary";
  const hubTitle = resolvedTab === "summary" ? "Summary" : "Analytics";
  const canToggleInternally = canViewAnalytics && showModeToggle && !mode;

  // Day name formatter
  const formatDayLabel = (year, month, day) => {
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${dayNames[dateObj.getDay()]} ${day}`;
  };

  const trendData = useMemo(
    () =>
      trends.map((item) => ({
        label: `${item.month}/${item.year}`,
        income: Number(item.totalIncome || 0),
        expense: Number(item.totalExpense || 0),
      })),
    [trends]
  );

  const last7DaysChartData = useMemo(
    () =>
      last7DaysTrends.map((item) => ({
        label: formatDayLabel(item.year, item.month, item.day),
        income: Number(item.totalIncome || 0),
        expense: Number(item.totalExpense || 0),
      })),
    [last7DaysTrends]
  );

  // Group by category and type for color logic
  const barData = useMemo(() => {
    const grouped = categories.reduce((acc, item) => {
      const key = item.category || "Other";
      const type = item.type || "EXPENSE";
      const current = acc.get(key) || { total: 0, type };
      acc.set(key, { total: current.total + Number(item.total || 0), type });
      return acc;
    }, new Map());

    return Array.from(grouped.entries())
      .map(([name, { total, type }]) => ({ name, total, type }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [categories]);

  const donutData = useMemo(
    () =>
      categories
        .filter((item) => item.type === "EXPENSE")
        .map((item) => ({ name: item.category, value: Number(item.total || 0) }))
        .filter((item) => item.value > 0),
    [categories]
  );

  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpense = Number(summary?.totalExpense || 0);
  const netBalance = Number(summary?.netBalance || 0);

  const summaryCards = useMemo(() => [
    {
      key: "income",
      title: "Total Income",
      value: formatInr(totalIncome),
      icon: FiTrendingUp,
      tone: SUCCESS_COLOR,
      hint: "All credited value",
    },
    {
      key: "expense",
      title: "Total Expense",
      value: formatInr(totalExpense),
      icon: FiActivity,
      tone: DANGER_COLOR,
      hint: "All debited value",
    },
    {
      key: "balance",
      title: "Net Balance",
      value: formatInr(netBalance),
      icon: FiBarChart2,
      tone: netBalance >= 0 ? SUCCESS_COLOR : DANGER_COLOR,
      hint: "Income minus expense",
    },
  ], [netBalance, totalExpense, totalIncome]);

  return (
    <section className="zf-section" id="analytics" aria-label="Analytics and summary">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="zf-section__title mb-0">{hubTitle}</h2>
        </div>

        {canToggleInternally ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 p-1 backdrop-blur-md">
            <button
              type="button"
              role="tab"
              aria-selected={resolvedTab === "summary"}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${resolvedTab === "summary" ? "bg-slate-100 text-slate-900" : "text-slate-200"}`}
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={resolvedTab === "analytics"}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${resolvedTab === "analytics" ? "bg-slate-100 text-slate-900" : "text-slate-200"}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>
        ) : null}
      </div>

      {resolvedTab === "summary" ? (
        <div role="tabpanel">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.key} className={glassTileClass} title={card.hint}>
                  <div className="mb-2 flex items-center gap-2 text-slate-200">
                    <Icon size={16} />
                    <p className="text-xs uppercase tracking-wide text-slate-300">{card.title}</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: card.tone }}>{card.value}</p>
                </article>
              );
            })}
          </div>

          {!canViewAnalytics && showAccessRestricted ? (
            <div className="zf-access-restricted" role="note" aria-live="polite">
              Access Restricted: Analytics is available for ANALYST and ADMIN roles only.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2" role="tabpanel">
          <>
              {/* Monthly Trends Chart */}
              <article className={glassTileClass}>
                <h3 className="mb-2 text-base font-semibold text-slate-100">Monthly Trends</h3>
                {!trendData.length ? (
                  <NoDataCard title="No Data Available" subtitle="Monthly trend chart requires date-distributed records." />
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="analyticsIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={SUCCESS_COLOR} stopOpacity={0.42} />
                            <stop offset="100%" stopColor={SUCCESS_COLOR} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="analyticsExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={DANGER_COLOR} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={DANGER_COLOR} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                        <XAxis dataKey="label" stroke="#fff" tick={{ fill: '#fff', fontWeight: 'bold' }} />
                        <YAxis tickFormatter={(value) => Number(value).toLocaleString()} stroke="#fff" tick={{ fill: '#fff', fontWeight: 'bold' }} />
                        <Tooltip 
                          formatter={(value) => formatInr(value)} 
                          contentStyle={{ backgroundColor: '#222', color: '#fff', border: '1px solid #888' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                        />
                        <Area type="monotone" dataKey="income" stroke={SUCCESS_COLOR} fill="url(#analyticsIncomeGradient)" strokeWidth={2.2} />
                        <Area type="monotone" dataKey="expense" stroke={DANGER_COLOR} fill="url(#analyticsExpenseGradient)" strokeWidth={2.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              {/* Last 7 Days Trend Chart */}
              <article className={glassTileClass}>
                <h3 className="mb-2 text-base font-semibold text-slate-100">Last 7 Days</h3>
                {!last7DaysChartData.length ? (
                  <NoDataCard title="No Data Available" subtitle="7-day chart requires recent records." />
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={last7DaysChartData}>
                        <defs>
                          <linearGradient id="last7DaysIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={SUCCESS_COLOR} stopOpacity={0.42} />
                            <stop offset="100%" stopColor={SUCCESS_COLOR} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="last7DaysExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={DANGER_COLOR} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={DANGER_COLOR} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                        <XAxis dataKey="label" stroke="#fff" tick={{ fill: '#fff', fontWeight: 'bold' }} angle={-45} textAnchor="end" height={60} />
                        <YAxis tickFormatter={(value) => Number(value).toLocaleString()} stroke="#fff" tick={{ fill: '#fff', fontWeight: 'bold' }} />
                        <Tooltip 
                          formatter={(value) => formatInr(value)} 
                          contentStyle={{ backgroundColor: '#222', color: '#fff', border: '1px solid #888' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                        />
                        <Area type="monotone" dataKey="income" stroke={SUCCESS_COLOR} fill="url(#last7DaysIncomeGradient)" strokeWidth={2.2} />
                        <Area type="monotone" dataKey="expense" stroke={DANGER_COLOR} fill="url(#last7DaysExpenseGradient)" strokeWidth={2.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              {/* Category Totals Chart */}
              <article className={glassTileClass}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-100">Category Totals</h3>
                  <FiBarChart2 className="text-slate-200" />
                </div>
                <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-slate-300">
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SUCCESS_COLOR }} />Income</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DANGER_COLOR }} />Expense</span>
                </div>
                {!barData.length ? (
                  <NoDataCard title="No Data Available" subtitle="Category totals appear when categorized records exist." />
                ) : (
                  <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                        <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontWeight: 'bold' }} interval={0} angle={-18} textAnchor="end" height={54} />
                        <YAxis tickFormatter={(value) => Number(value).toLocaleString()} stroke="#fff" tick={{ fill: '#fff', fontWeight: 'bold' }} />
                        <Tooltip 
                          formatter={(value, _name, item) => [formatInr(value), item?.payload?.type || "Type"]} 
                          contentStyle={{ backgroundColor: '#222', color: '#fff', border: '1px solid #888' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                          {barData.map((entry) => (
                            <Cell key={`bar-${entry.name}`} fill={entry.type === "INCOME" ? SUCCESS_COLOR : DANGER_COLOR} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              {/* Expense Distribution Chart */}
              <article className={glassTileClass}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-100">Expense Distribution</h3>
                  <FiPieChart className="text-slate-200" />
                </div>
                {!donutData.length ? (
                  <NoDataCard title="No Data Available" subtitle="Expense distribution appears after expense records are available." />
                ) : (
                  <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={105}>
                          {donutData.map((entry, index) => (
                            <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatInr(value)} 
                          contentStyle={{ backgroundColor: '#222', color: '#fff', border: '1px solid #888' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                        />
                        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12} fontWeight="bold">
                          Net Balance
                        </text>
                        <text
                          x="50%"
                          y="55%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={netBalance >= 0 ? SUCCESS_COLOR : DANGER_COLOR}
                          fontSize={20}
                          fontWeight={700}
                          style={{ textShadow: '0 1px 4px #000, 0 0 2px #000' }}
                        >
                          {formatInr(netBalance)}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              {/* Cash Flow Sankey - Full width at the bottom of analytics */}
              <div className="xl:col-span-2">
                <CashFlowSankey categories={categories} records={records} />
              </div>
            </>
        </div>
      )}
    </section>
  );
}

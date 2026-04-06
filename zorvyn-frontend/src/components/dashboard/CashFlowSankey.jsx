import { useMemo } from "react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

const INCOME_COLOR = "#10B981";
const EXPENSE_COLOR = "#EF4444";
const CATEGORY_COLOR = "#0EA5E9";

function toAmount(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInr(value) {
  return `INR ${toAmount(value).toLocaleString()}`;
}

function buildTotalsFromCategories(categories) {
  const incomeByCategory = {};
  const expenseByCategory = {};

  categories.forEach((item) => {
    const category = item?.category || "Other";
    const amount = toAmount(item?.total);
    if (amount <= 0) return;

    if (item?.type === "INCOME") {
      incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
      return;
    }

    expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
  });

  return { incomeByCategory, expenseByCategory };
}

function buildTotalsFromRecords(records) {
  const incomeByCategory = {};
  const expenseByCategory = {};

  records.forEach((item) => {
    const category = item?.category || "Other";
    const amount = toAmount(item?.amount);
    if (amount <= 0) return;

    if (item?.type === "INCOME") {
      incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
      return;
    }

    if (item?.type === "EXPENSE") {
      expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
    }
  });

  return { incomeByCategory, expenseByCategory };
}

function buildSankeyData(incomeByCategory, expenseByCategory) {
  const categoryNames = Array.from(
    new Set([...Object.keys(incomeByCategory), ...Object.keys(expenseByCategory)]),
  ).sort((a, b) => {
    const aTotal = (incomeByCategory[a] || 0) + (expenseByCategory[a] || 0);
    const bTotal = (incomeByCategory[b] || 0) + (expenseByCategory[b] || 0);
    return bTotal - aTotal;
  });

  const nodes = [
    { name: "Income" },
    { name: "Expense" },
    ...categoryNames.map((name) => ({ name })),
  ];

  const links = [];
  const categoryIndex = new Map(categoryNames.map((name, index) => [name, index + 2]));

  Object.entries(incomeByCategory).forEach(([category, amount]) => {
    const target = categoryIndex.get(category);
    if (target === undefined || amount <= 0) return;
    links.push({ source: 0, target, value: amount });
  });

  Object.entries(expenseByCategory).forEach(([category, amount]) => {
    const target = categoryIndex.get(category);
    if (target === undefined || amount <= 0) return;
    links.push({ source: 1, target, value: amount });
  });

  return { nodes, links };
}

function renderNode(nodeProps) {
  const { x, y, width, height, payload } = nodeProps;
  const isSource = payload?.depth === 0;
  const label = payload?.name || "Category";

  let fill = CATEGORY_COLOR;
  if (label === "Income") fill = INCOME_COLOR;
  if (label === "Expense") fill = EXPENSE_COLOR;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.92}
        stroke="rgba(15,23,42,0.8)"
        strokeWidth={1}
        rx={3}
      />
      <text
        x={isSource ? x + width + 6 : x - 6}
        y={y + height / 2}
        textAnchor={isSource ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={12}
        fill="#fff"
        fontWeight="bold"
        style={{ textShadow: "0 1px 4px #000, 0 0 2px #000" }}
      >
        {label}
      </text>
    </g>
  );
}

export default function CashFlowSankey({ categories = [], records = [] }) {
  const totals = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return buildTotalsFromCategories(categories);
    }
    return buildTotalsFromRecords(records);
  }, [categories, records]);

  const data = useMemo(
    () => buildSankeyData(totals.incomeByCategory, totals.expenseByCategory),
    [totals],
  );

  if (!data.links.length) {
    return (
      <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md">
        <h3 className="mb-3 text-base font-semibold text-slate-100">Cash Flow Overview</h3>
        <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-slate-400/30 bg-slate-900/20">
          <p className="text-sm text-slate-400">No cash flow data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md shadow-[0_18px_36px_rgba(2,8,23,0.35)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-100">Cash Flow Overview</h3>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
            Income
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
            Expense
          </span>
        </div>
      </div>

      <div className="h-96 w-full rounded-lg border border-slate-700/30 bg-slate-900/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            node={renderNode}
            link={{ stroke: "rgba(148,163,184,0.45)", fill: "none", opacity: 0.55 }}
            nodePadding={24}
            nodeWidth={14}
            linkCurvature={0.4}
            margin={{ top: 12, right: 84, bottom: 12, left: 84 }}
          >
            <Tooltip
              formatter={(value) => formatInr(value)}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(148,163,184,0.3)",
                color: "#fff"
              }}
              itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
              labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

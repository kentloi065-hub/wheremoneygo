"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Expense } from "@/types";

type TimeFrame = "3M" | "12M" | "YTD" | "All";

const TIMEFRAME_OPTIONS: { label: TimeFrame; description: string }[] = [
  { label: "3M", description: "Last 3 months" },
  { label: "12M", description: "Last 12 months" },
  { label: "YTD", description: "Year to date" },
  { label: "All", description: "All time" },
];

interface MonthData {
  month: string;
  label: string;
  total: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-bold text-white">
          ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function MonthlyBarChart() {
  const [timeframe, setTimeframe] = useState<TimeFrame>("3M");
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: true });

    if (!error && rows) {
      setAllExpenses(rows as Expense[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (allExpenses.length === 0 && !loading) {
      setData([]);
      return;
    }

    const now = new Date();
    let months: Date[] = [];

    if (timeframe === "3M") {
      months = [2, 1, 0].map((i) => subMonths(now, i));
    } else if (timeframe === "12M") {
      months = Array.from({ length: 12 }, (_, i) => subMonths(now, 11 - i));
    } else if (timeframe === "YTD") {
      const startYear = startOfYear(now);
      const monthCount =
        (now.getFullYear() - startYear.getFullYear()) * 12 +
        now.getMonth() -
        startYear.getMonth() +
        1;
      months = Array.from({ length: monthCount }, (_, i) =>
        subMonths(now, monthCount - 1 - i)
      );
    } else {
      // All — derive from actual data
      if (allExpenses.length === 0) {
        setData([]);
        return;
      }
      const earliest = allExpenses[0].date;
      const earliestDate = parseISO(earliest);
      const monthCount =
        (now.getFullYear() - earliestDate.getFullYear()) * 12 +
        now.getMonth() -
        earliestDate.getMonth() +
        1;
      months = Array.from({ length: Math.max(monthCount, 1) }, (_, i) =>
        subMonths(now, monthCount - 1 - i)
      );
    }

    const computed: MonthData[] = months.map((month) => {
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end = format(endOfMonth(month), "yyyy-MM-dd");
      const total = allExpenses
        .filter((e) => e.date >= start && e.date <= end)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        month: format(month, "yyyy-MM"),
        label: format(month, "MMM yy"),
        total,
      };
    });

    setData(computed);
  }, [timeframe, allExpenses, loading]);

  const maxTotal = Math.max(...data.map((d) => d.total), 0);
  const currentMonthKey = format(new Date(), "yyyy-MM");

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Monthly Spending</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {TIMEFRAME_OPTIONS.find((t) => t.label === timeframe)?.description}
            </p>
          </div>
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-700/50 rounded-xl p-1">
            {TIMEFRAME_OPTIONS.map(({ label }) => (
              <button
                key={label}
                onClick={() => setTimeframe(label)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === label
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-52 flex items-end gap-2 pb-4 pt-2">
            {[...Array(timeframe === "3M" ? 3 : 6)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-700 rounded-lg animate-pulse"
                style={{ height: `${40 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">No data yet</p>
            </div>
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={timeframe === "All" && data.length > 12 ? 10 : 28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                  width={42}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={
                        entry.month === currentMonthKey
                          ? "#6366f1"
                          : entry.total === maxTotal
                          ? "#8b5cf6"
                          : "#334155"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Average"
            value={data.reduce((s, d) => s + d.total, 0) / data.length}
          />
          <StatCard label="Highest" value={Math.max(...data.map((d) => d.total))} />
          <StatCard
            label="Total"
            value={data.reduce((s, d) => s + d.total, 0)}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">
        ${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

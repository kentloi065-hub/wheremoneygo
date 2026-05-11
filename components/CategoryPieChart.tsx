"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Category, CATEGORY_COLORS } from "@/types";

interface Props {
  data: { category: Category; total: number }[];
  total: number;
}

interface ActiveSegment {
  category: Category;
  total: number;
}

export default function CategoryPieChart({ data, total }: Props) {
  const [active, setActive] = useState<ActiveSegment | null>(null);

  return (
    <div className="relative h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={128}
            paddingAngle={2}
            dataKey="total"
            nameKey="category"
            strokeWidth={0}
            onMouseEnter={(d) => setActive({ category: d.category, total: d.total })}
            onMouseLeave={() => setActive(null)}
          >
            {data.map(({ category }) => (
              <Cell
                key={category}
                fill={CATEGORY_COLORS[category]}
                opacity={active && active.category !== category ? 0.4 : 1}
                style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        {active ? (
          <>
            <p className="text-xs text-slate-400 mb-0.5">{active.category}</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p
                className="text-2xl font-bold leading-none"
                style={{ color: CATEGORY_COLORS[active.category] }}
              >
                ${active.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm font-medium text-slate-400">
                {((active.total / total) * 100).toFixed(1)}%
              </p>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Spent</p>
            <p className="text-4xl font-bold text-white leading-none">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
            <p className="text-4xl font-bold text-white leading-none">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

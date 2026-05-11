"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/types";
import CategoryPieChart from "./CategoryPieChart";

interface CategoryTotal {
  category: Category;
  total: number;
}

interface Props {
  currentMonth: Date;
  total: number;
  categoryTotals: CategoryTotal[];
  onPrev: () => void;
  onNext: () => void;
  loading: boolean;
}

export default function SummaryCard({
  currentMonth,
  total,
  categoryTotals,
  onPrev,
  onNext,
  loading,
}: Props) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700/50 shadow-xl">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm text-slate-400 font-medium">
            {format(currentMonth, "yyyy")}
          </p>
          <h2 className="text-xl font-bold text-white">
            {format(currentMonth, "MMMM")}
          </h2>
        </div>
        <button
          onClick={onNext}
          className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 active:scale-95 transition-all text-slate-300 hover:text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Pie Chart */}
      {!loading && categoryTotals.length > 0 ? (
        <CategoryPieChart data={categoryTotals} total={total} />
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center h-72 text-slate-500">
          <span className="text-3xl mb-2">🪹</span>
          <p className="text-sm">No expenses this month</p>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center">
          <div className="w-56 h-56 rounded-full bg-slate-700 animate-pulse" />
        </div>
      )}

    </div>
  );
}

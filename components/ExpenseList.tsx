"use client";

import { format, parseISO } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from "@/types";
import { useState } from "react";

interface Props {
  expenses: Expense[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, loading, onDelete, onEdit }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-2xl mb-2">📋</p>
        <p className="text-sm">No expenses recorded yet</p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, expense) => {
    const dateKey = expense.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
        Transactions
      </h3>
      {sortedDates.map((date) => (
        <div key={date}>
          <p className="text-xs font-medium text-slate-500 mb-2 px-1">
            {format(parseISO(date), "EEEE, d MMMM")}
          </p>
          <div className="space-y-2">
            {grouped[date].map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onDelete={() => handleDelete(expense.id)}
                onEdit={() => onEdit(expense)}
                isDeleting={deletingId === expense.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseItem({
  expense,
  onDelete,
  onEdit,
  isDeleting,
}: {
  expense: Expense;
  onDelete: () => void;
  onEdit: () => void;
  isDeleting: boolean;
}) {
  const color = CATEGORY_COLORS[expense.category];
  const icon = CATEGORY_ICONS[expense.category];

  return (
    <div
      className={`flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl p-3.5 transition-all ${
        isDeleting ? "opacity-40 scale-95" : ""
      }`}
    >
      {/* Category Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {expense.note || expense.category}
        </p>
        <p className="text-xs text-slate-500 truncate">{expense.category}</p>
      </div>

      {/* Amount */}
      <p className="text-sm font-bold text-white flex-shrink-0">
        ${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:cursor-not-allowed"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

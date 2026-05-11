"use client";

import { useState, useEffect } from "react";
import { format, addMonths, parseISO } from "date-fns";
import { X, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ALL_CATEGORIES, Category, CATEGORY_COLORS, CATEGORY_ICONS, Expense } from "@/types";

interface Props {
  onClose: () => void;
  editingExpense: Expense | null;
}

export default function AddExpenseModal({ onClose, editingExpense }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [recurring, setRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setDate(editingExpense.date);
      setNote(editingExpense.note || "");
      setCategory(editingExpense.category);
    }
  }, [editingExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    const basePayload = {
      amount: parsedAmount,
      note: note.trim() || null,
      category,
    };

    let dbError;
    if (editingExpense) {
      ({ error: dbError } = await supabase
        .from("expenses")
        .update({ ...basePayload, date })
        .eq("id", editingExpense.id));
    } else if (recurring) {
      const groupId = crypto.randomUUID();
      const baseDate = parseISO(date);
      const rows = Array.from({ length: recurringMonths }, (_, i) => ({
        ...basePayload,
        date: format(addMonths(baseDate, i), "yyyy-MM-dd"),
        recurring_group_id: groupId,
      }));
      ({ error: dbError } = await supabase.from("expenses").insert(rows));
    } else {
      ({ error: dbError } = await supabase.from("expenses").insert({ ...basePayload, date }));
    }

    setSaving(false);
    if (dbError) {
      setError("Failed to save. Check your Supabase connection.");
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-slate-900 sm:rounded-2xl rounded-t-2xl border border-slate-700/60 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingExpense ? "Edit Expense" : "New Expense"}
            </h2>
            {editingExpense?.recurring_group_id && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <RefreshCw size={11} className="text-indigo-400" />
                <span className="text-xs text-indigo-400">Part of a recurring series</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5 overflow-y-auto flex-1">
          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all [color-scheme:dark]"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat];
                const icon = CATEGORY_ICONS[cat];
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all text-center"
                    style={
                      selected
                        ? {
                            backgroundColor: `${color}20`,
                            borderColor: color,
                            boxShadow: `0 0 0 1px ${color}`,
                          }
                        : {
                            backgroundColor: "rgb(30 41 59 / 0.6)",
                            borderColor: "rgb(51 65 85 / 0.5)",
                          }
                    }
                  >
                    <span className="text-lg">{icon}</span>
                    <span
                      className="text-[10px] font-medium leading-tight"
                      style={{ color: selected ? color : "#94a3b8" }}
                    >
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Note <span className="text-slate-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Recurring — only shown when adding, not editing */}
          {!editingExpense && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setRecurring((r) => !r)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  recurring
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    recurring ? "border-indigo-500 bg-indigo-500" : "border-slate-600"
                  }`}
                >
                  {recurring && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <RefreshCw size={14} className={recurring ? "text-indigo-400" : "text-slate-500"} />
                <span className="text-sm font-medium">Recurring expense</span>
              </button>

              {recurring && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 mb-3">
                    Repeat for how many months (starting from the date above)?
                  </p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRecurringMonths(n)}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                          recurringMonths === n
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This will create <span className="text-indigo-400 font-medium">{recurringMonths} entries</span> across {recurringMonths} months.
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/40"
          >
            {saving
              ? "Saving..."
              : editingExpense
              ? "Save Changes"
              : recurring
              ? `Add ${recurringMonths} Recurring Entries`
              : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}

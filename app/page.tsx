"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Expense, ALL_CATEGORIES } from "@/types";
import SummaryCard from "@/components/SummaryCard";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseModal from "@/components/AddExpenseModal";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import { Plus, BarChart2, LayoutDashboard } from "lucide-react";

type Tab = "overview" | "trends";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    if (!error && data) {
      setExpenses(data as Expense[]);
    }
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const handleDelete = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  })).filter((c) => c.total > 0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-white tracking-tight">
            💰 Expense Tracker
          </h1>
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard size={14} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "trends"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart2 size={14} />
              Trends
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-24 pt-4">
        {activeTab === "overview" ? (
          <>
            <SummaryCard
              currentMonth={currentMonth}
              total={totalSpending}
              categoryTotals={categoryTotals}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              loading={loading}
            />
            <div className="mt-4">
              <ExpenseList
                expenses={expenses}
                loading={loading}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </>
        ) : (
          <MonthlyBarChart />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-1/2 translate-x-1/2 sm:right-6 sm:translate-x-0 z-20 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-lg shadow-indigo-900/50 transition-all"
      >
        <Plus size={20} strokeWidth={2.5} />
        Add Expense
      </button>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <AddExpenseModal
          onClose={handleModalClose}
          editingExpense={editingExpense}
        />
      )}
    </div>
  );
}

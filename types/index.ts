export type Category =
  | "Subscriptions"
  | "Family"
  | "Food"
  | "Taxi"
  | "Public Transport"
  | "Entertainment"
  | "Travel"
  | "Shopping"
  | "Hobbies"
  | "Medical"
  | "Personal Care";

export const ALL_CATEGORIES: Category[] = [
  "Subscriptions",
  "Family",
  "Food",
  "Taxi",
  "Public Transport",
  "Entertainment",
  "Travel",
  "Shopping",
  "Hobbies",
  "Medical",
  "Personal Care",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Subscriptions: "#8b5cf6",
  Family: "#ec4899",
  Food: "#f97316",
  Taxi: "#eab308",
  "Public Transport": "#3b82f6",
  Entertainment: "#ef4444",
  Travel: "#14b8a6",
  Shopping: "#22c55e",
  Hobbies: "#6366f1",
  Medical: "#06b6d4",
  "Personal Care": "#f43f5e",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Subscriptions: "📺",
  Family: "👨‍👩‍👧",
  Food: "🍔",
  Taxi: "🚕",
  "Public Transport": "🚌",
  Entertainment: "🎬",
  Travel: "✈️",
  Shopping: "🛍️",
  Hobbies: "🎨",
  Medical: "💊",
  "Personal Care": "💅",
};

export interface Expense {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  category: Category;
  recurring_group_id: string | null;
  created_at: string;
}

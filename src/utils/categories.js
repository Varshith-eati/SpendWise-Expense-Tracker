export const CATEGORIES = [
  { id: "food", label: "Food & Dining", emoji: "🍔", color: "#f59e0b", bg: "#fef3c7", type: "expense" },
  { id: "groceries", label: "Groceries & Essentials", emoji: "🛒", color: "#10b981", bg: "#d1fae5", type: "expense" },
  { id: "housing", label: "Rent & Housing", emoji: "🏠", color: "#6366f1", bg: "#e0e7ff", type: "expense" },
  { id: "transport", label: "Travel & Transit", emoji: "🚗", color: "#3b82f6", bg: "#dbeafe", type: "expense" },
  { id: "utilities", label: "Bills & Utilities", emoji: "💡", color: "#eab308", bg: "#fef9c3", type: "expense" },
  { id: "shopping", label: "Shopping & Lifestyle", emoji: "🛍️", color: "#ec4899", bg: "#fce7f3", type: "expense" },
  { id: "entertainment", label: "Fun & Entertainment", emoji: "🎬", color: "#8b5cf6", bg: "#ede9fe", type: "expense" },
  { id: "health", label: "Health & Wellness", emoji: "💊", color: "#ef4444", bg: "#fee2e2", type: "expense" },
  { id: "salary", label: "Salary & Wages", emoji: "💼", color: "#059669", bg: "#d1fae5", type: "income" },
  { id: "freelance", label: "Freelance & Projects", emoji: "💻", color: "#2563eb", bg: "#dbeafe", type: "income" },
  { id: "investment", label: "Investments & Dividends", emoji: "📈", color: "#0d9488", bg: "#ccfbf1", type: "income" },
  { id: "gift", label: "Gifts & Bonuses", emoji: "🎁", color: "#d946ef", bg: "#fae8ff", type: "both" },
  { id: "other", label: "Miscellaneous", emoji: "✨", color: "#64748b", bg: "#f1f5f9", type: "both" },
];

export const MOODS = [
  { id: "worth-it", label: "Worth every penny", emoji: "😊" },
  { id: "milestone", label: "Goal milestone", emoji: "🌟" },
  { id: "essential", label: "Essential need", emoji: "🛒" },
  { id: "treat", label: "Daily little treat", emoji: "☕" },
  { id: "impulse", label: "Could have skipped", emoji: "😬" },
  { id: "invest", label: "Investing in myself", emoji: "🌱" },
];

export const QUICK_PRESETS = [
  { label: "Morning Coffee", amount: 6.5, type: "expense", category: "Food & Dining", emoji: "☕", mood: "Daily little treat" },
  { label: "Healthy Lunch", amount: 18.0, type: "expense", category: "Food & Dining", emoji: "🥗", mood: "Essential need" },
  { label: "Weekly Groceries", amount: 85.0, type: "expense", category: "Groceries & Essentials", emoji: "🛒", mood: "Essential need" },
  { label: "Gas / Transit", amount: 35.0, type: "expense", category: "Travel & Transit", emoji: "🚗", mood: "Essential need" },
  { label: "Paycheck Deposit", amount: 2400.0, type: "income", category: "Salary & Wages", emoji: "💼", mood: "Goal milestone" },
  { label: "Freelance Gig", amount: 450.0, type: "income", category: "Freelance & Projects", emoji: "💻", mood: "Investing in myself" },
];

export const SAMPLE_TRANSACTIONS = [
  {
    id: "sample-1",
    description: "Monthly Salary Deposit",
    transactionAmount: 4200,
    transactionType: "income",
    category: "Salary & Wages",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    mood: "Goal milestone",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "sample-2",
    description: "Trader Joe's Organic Groceries",
    transactionAmount: 142.85,
    transactionType: "expense",
    category: "Groceries & Essentials",
    date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    mood: "Essential need",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: "sample-3",
    description: "Specialty Pour-over & Almond Croissant",
    transactionAmount: 9.5,
    transactionType: "expense",
    category: "Food & Dining",
    date: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    mood: "Daily little treat",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
  },
  {
    id: "sample-4",
    description: "Freelance UI/UX Design Milestone",
    transactionAmount: 680,
    transactionType: "income",
    category: "Freelance & Projects",
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    mood: "Investing in myself",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "sample-5",
    description: "Monthly Gym & Yoga Membership",
    transactionAmount: 75,
    transactionType: "expense",
    category: "Health & Wellness",
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    mood: "Worth every penny",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "sample-6",
    description: "High-Speed Fiber Internet Bill",
    transactionAmount: 60,
    transactionType: "expense",
    category: "Bills & Utilities",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    mood: "Essential need",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const getCategoryMeta = (categoryName) => {
  const found = CATEGORIES.find(
    (c) => c.label.toLowerCase() === (categoryName || "").toLowerCase() || c.id === (categoryName || "").toLowerCase()
  );
  return (
    found || {
      id: "other",
      label: categoryName || "Miscellaneous",
      emoji: "✨",
      color: "#64748b",
      bg: "#f1f5f9",
    }
  );
};


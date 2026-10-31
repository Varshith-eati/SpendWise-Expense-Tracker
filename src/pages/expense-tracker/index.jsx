import React, { useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase-config";
import { useAddTransaction } from "../../hooks/useAddTransaction";
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useDeleteTransaction } from "../../hooks/useDeleteTransaction";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import {
  CATEGORIES,
  MOODS,
  QUICK_PRESETS,
  getCategoryMeta,
} from "../../utils/categories";
import {
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  DownloadIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  CoffeeIcon,
  CheckCircleIcon,
  PieChartIcon,
} from "../../components/Icons";
import "./styles.css";

export const ExpenseTracker = () => {
  const { addTransaction } = useAddTransaction();
  const { deleteTransaction } = useDeleteTransaction();
  const { transactions, transactionTotals, loading } = useGetTransactions();
  const { name, profilePhoto, isGuest } = useGetUserInfo();
  const navigate = useNavigate();

  // Form State
  const [description, setDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [category, setCategory] = useState("Food & Dining");
  const [mood, setMood] = useState("Essential need");
  const [customDate, setCustomDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'income' | 'expense'
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const {
    balance,
    income,
    expenses,
    savingsRate,
    categoryBreakdown,
    averageExpense,
    highestExpense,
  } = transactionTotals;

  // Time-based human greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: <SunIcon size={18} /> };
    if (hour < 17) return { text: "Good afternoon", icon: <CoffeeIcon size={18} /> };
    if (hour < 21) return { text: "Good evening", icon: <SunIcon size={18} /> };
    return { text: "Restful evening", icon: <MoonIcon size={18} /> };
  }, []);

  // Today's formatted date string
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Filtered & sorted transactions
  const displayedTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const matchesSearch = (item.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          filterType === "all" || item.transactionType === filterType;
        const matchesCat =
          filterCategory === "all" || item.category === filterCategory;
        return matchesSearch && matchesType && matchesCat;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || 0).getTime();
        const amountA = Number(a.transactionAmount) || 0;
        const amountB = Number(b.transactionAmount) || 0;

        if (sortBy === "newest") return timeB - timeA;
        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "highest") return amountB - amountA;
        if (sortBy === "lowest") return amountA - amountB;
        return 0;
      });
  }, [transactions, searchTerm, filterType, filterCategory, sortBy]);

  // Handle Form Submit
  const handleAddTransaction = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(transactionAmount);
    if (!description.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addTransaction({
      description,
      transactionAmount: amountNum,
      transactionType,
      category,
      date: customDate ? new Date(customDate).toISOString() : new Date().toISOString(),
      mood,
    });

    showToast(
      transactionType === "income"
        ? `Added income: $${amountNum.toFixed(2)} 🎉`
        : `Tracked expense: $${amountNum.toFixed(2)} ✨`
    );

    setDescription("");
    setTransactionAmount("");
  };

  // Quick Preset Click
  const handlePresetClick = (preset) => {
    setDescription(preset.label);
    setTransactionAmount(preset.amount);
    setTransactionType(preset.type);
    setCategory(preset.category);
    if (preset.mood) setMood(preset.mood);
    showToast(`Quick loaded "${preset.label}"`);
  };

  // Sign out
  const signUserOut = async () => {
    try {
      if (!isGuest) {
        await signOut(auth);
      }
      localStorage.removeItem("auth");
      navigate("/");
    } catch (err) {
      console.error(err);
      localStorage.clear();
      navigate("/");
    }
  };

  // Delete transaction
  const handleDelete = (id, desc) => {
    if (window.confirm(`Delete "${desc}"?`)) {
      deleteTransaction(id);
      showToast(`Removed "${desc}"`);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }

    const headers = ["Description", "Type", "Amount", "Category", "Date", "Mood"];
    const rows = transactions.map((t) => [
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.transactionType,
      t.transactionAmount,
      `"${t.category || "General"}"`,
      `"${new Date(t.date || t.createdAt || Date.now()).toLocaleDateString()}"`,
      `"${t.mood || "Normal"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spendwise_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported transactions to CSV! 📄");
  };

  // Financial coach human insight message
  const coachMessage = useMemo(() => {
    if (transactions.length === 0) {
      return {
        tag: "Welcome Friend",
        text: "Ready to start your financial wellness journey? Add your first transaction or click any preset below!",
        mood: "warm",
      };
    }
    if (savingsRate >= 40) {
      return {
        tag: "Thriving Saver",
        text: `Remarkable discipline! You're saving ${savingsRate}% of your income. You are building solid security and peace of mind.`,
        mood: "emerald",
      };
    }
    if (savingsRate >= 15) {
      return {
        tag: "Healthy Balance",
        text: `Looking great! You've maintained a ${savingsRate}% savings cushion. Consistent awareness is your biggest asset.`,
        mood: "indigo",
      };
    }
    if (balance >= 0) {
      return {
        tag: "Mindful Pace",
        text: `You're staying in the green. Try setting aside a modest 5% cushion from your next income entry to build buffer!`,
        mood: "amber",
      };
    }
    return {
      tag: "Gentle Reminder",
      text: `Expenses are currently $${Math.abs(balance).toFixed(2)} higher than earnings. A few mindful adjustments this week can balance it out smoothly!`,
      mood: "rose",
    };
  }, [transactions.length, savingsRate, balance]);

  return (
    <div className="tracker-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="tracker-toast animate-fade-in">
          <CheckCircleIcon size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="nav-brand">
          <div className="nav-logo-icon">
            <SparklesIcon size={18} />
          </div>
          <div>
            <span className="nav-brand-title">SpendWise</span>
            <span className="nav-date-sub">{todayFormatted}</span>
          </div>
        </div>

        <div className="nav-user-area">
          <div className="user-info-chip">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={name}
                className="user-avatar"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="user-avatar fallback-avatar">
                {(name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-text-meta">
              <span className="user-greeting-name">{name}</span>
              <span className="user-status-pill">
                {isGuest ? "Guest Demo" : "Connected"}
              </span>
            </div>
          </div>

          <button className="signout-button" onClick={signUserOut} title="Sign Out">
            <LogOutIcon size={16} />
            <span className="signout-label">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="tracker-main-container animate-fade-in">
        {/* Human Greeting & Coach Banner */}
        <section className={`coach-banner coach-${coachMessage.mood}`}>
          <div className="coach-badge-row">
            <div className="greeting-pill">
              {greeting.icon}
              <span>{greeting.text}, {name}!</span>
            </div>
            <span className="coach-tag">{coachMessage.tag}</span>
          </div>
          <p className="coach-text">{coachMessage.text}</p>
        </section>

        {/* Financial Metrics Cards */}
        <section className="metrics-grid">
          {/* Net Balance Card */}
          <div className="metric-card card-balance">
            <div className="card-top-row">
              <span className="metric-label">Net Balance</span>
              <div className="metric-icon-circle balance-icon-wrap">
                <WalletIcon size={20} />
              </div>
            </div>
            <div className="metric-amount-row">
              <h2 className="metric-number">
                {balance >= 0 ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h2>
            </div>
            <div className="metric-footer-note">
              {balance >= 0 ? (
                <span className="badge-positive">● Healthy Positive</span>
              ) : (
                <span className="badge-negative">● Negative Deficit</span>
              )}
              <span className="metric-subtext">{transactions.length} total entries</span>
            </div>
          </div>

          {/* Income Card */}
          <div className="metric-card card-income">
            <div className="card-top-row">
              <span className="metric-label">Total Income</span>
              <div className="metric-icon-circle income-icon-wrap">
                <TrendingUpIcon size={20} />
              </div>
            </div>
            <div className="metric-amount-row">
              <h2 className="metric-number text-income">
                ${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="metric-footer-note">
              <span className="text-muted">Savings cushion</span>
              <span className="metric-highlight text-income">
                {savingsRate}% saved
              </span>
            </div>
          </div>

          {/* Expense Card */}
          <div className="metric-card card-expense">
            <div className="card-top-row">
              <span className="metric-label">Total Expenses</span>
              <div className="metric-icon-circle expense-icon-wrap">
                <TrendingDownIcon size={20} />
              </div>
            </div>
            <div className="metric-amount-row">
              <h2 className="metric-number text-expense">
                ${expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="metric-footer-note">
              <span className="text-muted">Avg: ${averageExpense.toFixed(0)}</span>
              <span className="metric-highlight text-expense">
                Max: ${highestExpense.toFixed(0)}
              </span>
            </div>
          </div>
        </section>

        {/* Visual Category Spending Breakdown Bar */}
        {expenses > 0 && Object.keys(categoryBreakdown).length > 0 && (
          <section className="category-breakdown-section">
            <div className="breakdown-header">
              <div className="breakdown-title">
                <PieChartIcon size={18} />
                <h3>Spending Distribution</h3>
              </div>
              <span className="breakdown-total">
                ${expenses.toFixed(2)} total spent
              </span>
            </div>

            {/* Visual ratio bar */}
            <div className="breakdown-bar-track">
              {Object.entries(categoryBreakdown).map(([catName, amt]) => {
                const meta = getCategoryMeta(catName);
                const percent = Math.max(3, Math.round((amt / expenses) * 100));
                return (
                  <div
                    key={catName}
                    className="breakdown-bar-segment"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: meta.color,
                    }}
                    title={`${meta.emoji} ${catName}: $${amt.toFixed(2)} (${percent}%)`}
                  />
                );
              })}
            </div>

            {/* Category Badges / Filters */}
            <div className="breakdown-badges">
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([catName, amt]) => {
                  const meta = getCategoryMeta(catName);
                  const pct = Math.round((amt / expenses) * 100);
                  const isActive = filterCategory === catName;
                  return (
                    <button
                      key={catName}
                      className={`breakdown-chip ${isActive ? "active-chip" : ""}`}
                      onClick={() =>
                        setFilterCategory(isActive ? "all" : catName)
                      }
                    >
                      <span className="chip-emoji">{meta.emoji}</span>
                      <span className="chip-name">{catName}</span>
                      <span className="chip-amt">${amt.toFixed(0)}</span>
                      <span className="chip-pct">{pct}%</span>
                    </button>
                  );
                })}
            </div>
          </section>
        )}

        {/* Quick Presets Bar */}
        <section className="presets-section">
          <div className="presets-label">
            <SparklesIcon size={15} />
            <span>Quick-Add Shortcuts:</span>
          </div>
          <div className="presets-scroll-row">
            {QUICK_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className={`preset-pill ${p.type === "income" ? "preset-income" : "preset-expense"}`}
                onClick={() => handlePresetClick(p)}
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
                <strong>+${p.amount}</strong>
              </button>
            ))}
          </div>
        </section>

        {/* Content Layout: Add Form & Transactions List */}
        <div className="tracker-split-grid">
          {/* Add Transaction Card Form */}
          <section className="form-card">
            <div className="form-card-header">
              <h3>Add New Transaction</h3>
              <p>Record your income or an expense mindfully.</p>
            </div>

            <form onSubmit={handleAddTransaction} className="transaction-form">
              {/* Type Switcher Toggle */}
              <div className="type-toggle-switch">
                <button
                  type="button"
                  className={`toggle-option ${transactionType === "expense" ? "active-expense" : ""}`}
                  onClick={() => {
                    setTransactionType("expense");
                    if (category === "Salary & Wages" || category === "Freelance & Projects") {
                      setCategory("Food & Dining");
                    }
                  }}
                >
                  <TrendingDownIcon size={16} />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  className={`toggle-option ${transactionType === "income" ? "active-income" : ""}`}
                  onClick={() => {
                    setTransactionType("income");
                    setCategory("Salary & Wages");
                  }}
                >
                  <TrendingUpIcon size={16} />
                  <span>Income</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="input-group">
                <label>Amount ($)</label>
                <div className="amount-input-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={transactionAmount}
                    required
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="input-group">
                <label>Description / Note</label>
                <input
                  type="text"
                  placeholder={
                    transactionType === "expense"
                      ? "e.g. Sushi dinner with friends, groceries..."
                      : "e.g. October consulting paycheck, bonus..."
                  }
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Category & Date Row */}
              <div className="form-two-cols">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.filter(
                      (c) =>
                        c.type === "both" ||
                        c.type === transactionType ||
                        (transactionType === "income" && c.type === "income")
                    ).map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Human Mood Tag Selector */}
              <div className="input-group">
                <label>How do you feel about this? (Human note)</label>
                <div className="mood-pills-row">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mood-pill ${mood === m.label ? "selected-mood" : ""}`}
                      onClick={() => setMood(m.label)}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`submit-tx-btn ${transactionType === "income" ? "btn-income" : "btn-expense"}`}
              >
                <PlusIcon size={18} />
                <span>
                  {transactionType === "income" ? "Log Income" : "Record Expense"}
                </span>
              </button>
            </form>
          </section>

          {/* Transactions List & Filter Card */}
          <section className="list-card">
            <div className="list-card-header">
              <div className="list-title-wrap">
                <h3>Transaction History</h3>
                <span className="count-pill">
                  {displayedTransactions.length} of {transactions.length}
                </span>
              </div>

              <div className="list-header-actions">
                <button
                  type="button"
                  className="export-btn"
                  onClick={exportToCSV}
                  title="Export to CSV"
                >
                  <DownloadIcon size={15} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="filter-toolbar">
              <div className="search-box">
                <SearchIcon size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="filters-row">
                {/* Type Filter Pills */}
                <div className="type-filter-pills">
                  <span className="filter-pill-label" style={{ display: "inline-flex", alignItems: "center", marginRight: 4, color: "var(--slate-500)" }}>
                    <FilterIcon size={14} />
                  </span>
                  <button
                    className={`filter-pill ${filterType === "all" ? "active-pill" : ""}`}
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-pill ${filterType === "expense" ? "active-pill" : ""}`}
                    onClick={() => setFilterType("expense")}
                  >
                    Expenses
                  </button>
                  <button
                    className={`filter-pill ${filterType === "income" ? "active-pill" : ""}`}
                    onClick={() => setFilterType("income")}
                  >
                    Income
                  </button>
                </div>

                {/* Sort selector */}
                <select
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">🕒 Newest</option>
                  <option value="oldest">⌛ Oldest</option>
                  <option value="highest">💰 Highest Amount</option>
                  <option value="lowest">🪙 Lowest Amount</option>
                </select>
              </div>
            </div>

            {/* Transactions Items */}
            <div className="transactions-scroll-area">
              {loading ? (
                <div className="empty-state-wrap">
                  <div className="loading-spinner" />
                  <p>Loading your financial history...</p>
                </div>
              ) : displayedTransactions.length === 0 ? (
                <div className="empty-state-wrap">
                  <div className="empty-icon-circle">
                    <SparklesIcon size={24} />
                  </div>
                  <h4>No transactions found</h4>
                  <p>
                    {searchTerm || filterType !== "all" || filterCategory !== "all"
                      ? "Try adjusting your search or filters to see more results."
                      : "Looks like a calm day for your wallet! Record a new transaction to begin."}
                  </p>
                </div>
              ) : (
                <ul className="transactions-ul">
                  {displayedTransactions.map((tx) => {
                    const isIncome = tx.transactionType === "income";
                    const meta = getCategoryMeta(tx.category);
                    const txDate = tx.date
                      ? new Date(tx.date)
                      : tx.createdAt?.toDate
                      ? tx.createdAt.toDate()
                      : new Date();

                    const dateString = txDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <li key={tx.id} className="transaction-item animate-fade-in">
                        <div
                          className="tx-category-badge"
                          style={{
                            backgroundColor: meta.bg || "#f1f5f9",
                            color: meta.color || "#475569",
                          }}
                        >
                          <span className="tx-emoji">{meta.emoji}</span>
                        </div>

                        <div className="tx-details">
                          <div className="tx-title-row">
                            <h4 className="tx-title">{tx.description}</h4>
                            <span
                              className={`tx-amount ${isIncome ? "amt-income" : "amt-expense"}`}
                            >
                              {isIncome ? "+" : "-"}$
                              {Number(tx.transactionAmount).toFixed(2)}
                            </span>
                          </div>

                          <div className="tx-meta-row">
                            <div className="tx-tags-group">
                              <span className="tx-date-badge">
                                <CalendarIcon size={12} />
                                {dateString}
                              </span>
                              <span className="tx-cat-badge">{tx.category || "General"}</span>
                              {tx.mood && (
                                <span className="tx-mood-badge">
                                  {tx.mood}
                                </span>
                              )}
                            </div>

                            <button
                              className="delete-tx-btn"
                              onClick={() => handleDelete(tx.id, tx.description)}
                              title="Delete transaction"
                            >
                              <TrashIcon size={15} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

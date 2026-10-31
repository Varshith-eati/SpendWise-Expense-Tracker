import { useEffect, useState, useCallback } from "react";
import {
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";
import { SAMPLE_TRANSACTIONS } from "../utils/categories";

export const useGetTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionTotals, setTransactionTotals] = useState({
    balance: 0.0,
    income: 0.0,
    expenses: 0.0,
    savingsRate: 0,
    categoryBreakdown: {},
    averageExpense: 0,
    highestExpense: 0,
    count: 0,
  });

  const { userID, isGuest } = useGetUserInfo();

  const computeTotals = useCallback((docs) => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let expenseCount = 0;
    let highestExpense = 0;
    const categoryBreakdown = {};

    docs.forEach((item) => {
      const amount = Number(item.transactionAmount) || 0;
      if (item.transactionType === "expense") {
        totalExpenses += amount;
        expenseCount += 1;
        if (amount > highestExpense) {
          highestExpense = amount;
        }

        const cat = item.category || "Other";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amount;
      } else {
        totalIncome += amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0
        ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))
        : 0;

    const averageExpense = expenseCount > 0 ? Math.round(totalExpenses / expenseCount) : 0;

    setTransactionTotals({
      balance,
      income: totalIncome,
      expenses: totalExpenses,
      savingsRate,
      categoryBreakdown,
      averageExpense,
      highestExpense,
      count: docs.length,
    });
  }, []);

  const loadGuestTransactions = useCallback(() => {
    let stored = [];
    try {
      const raw = localStorage.getItem("guest_transactions");
      if (raw) {
        stored = JSON.parse(raw);
      } else {
        stored = SAMPLE_TRANSACTIONS;
        localStorage.setItem("guest_transactions", JSON.stringify(SAMPLE_TRANSACTIONS));
      }
    } catch (e) {
      stored = SAMPLE_TRANSACTIONS;
    }

    setTransactions(stored);
    computeTotals(stored);
    setLoading(false);
  }, [computeTotals]);

  useEffect(() => {
    if (isGuest || !userID) {
      loadGuestTransactions();

      const handleUpdate = () => {
        loadGuestTransactions();
      };
      window.addEventListener("guest_transactions_updated", handleUpdate);
      return () => {
        window.removeEventListener("guest_transactions_updated", handleUpdate);
      };
    }

    let unsubscribe;
    try {
      const transactionCollectionRef = collection(db, "transactions");
      const queryTransactions = query(
        transactionCollectionRef,
        where("userID", "==", userID)
      );

      unsubscribe = onSnapshot(
        queryTransactions,
        (snapshot) => {
          let docs = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            docs.push({ ...data, id });
          });

          // Sort client-side by date / createdAt descending so index is not strictly required
          docs.sort((a, b) => {
            const timeA = a.createdAt?.toMillis
              ? a.createdAt.toMillis()
              : new Date(a.date || a.createdAt || 0).getTime();
            const timeB = b.createdAt?.toMillis
              ? b.createdAt.toMillis()
              : new Date(b.date || b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          setTransactions(docs);
          computeTotals(docs);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore snapshot error:", error);
          // Fallback to guest data if firestore rules or connection error occurs
          loadGuestTransactions();
        }
      );
    } catch (err) {
      console.error(err);
      loadGuestTransactions();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userID, isGuest, computeTotals, loadGuestTransactions]);

  return { transactions, transactionTotals, loading };
};

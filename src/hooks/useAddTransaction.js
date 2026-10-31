import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useAddTransaction = () => {
  const transactionCollectionRef = collection(db, "transactions");
  const { userID, isGuest } = useGetUserInfo();

  const addTransaction = async ({
    description,
    transactionAmount,
    transactionType,
    category = "Food & Dining",
    date = new Date().toISOString(),
    mood = "Essential need",
  }) => {
    const numericAmount = Math.abs(parseFloat(transactionAmount) || 0);
    if (!description.trim() || numericAmount <= 0) return;

    if (isGuest) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("guest_transactions") || "[]"
        );
        const newDoc = {
          id: "guest-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
          userID: userID || "guest-user",
          description: description.trim(),
          transactionAmount: numericAmount,
          transactionType,
          category,
          date: date || new Date().toISOString(),
          mood,
          createdAt: new Date().toISOString(),
        };
        const updated = [newDoc, ...stored];
        localStorage.setItem("guest_transactions", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("guest_transactions_updated"));
      } catch (err) {
        console.error("Failed to add guest transaction", err);
      }
      return;
    }

    try {
      await addDoc(transactionCollectionRef, {
        userID,
        description: description.trim(),
        transactionAmount: numericAmount,
        transactionType,
        category,
        date: date || new Date().toISOString(),
        mood,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to add transaction to Firestore:", err);
    }
  };

  return { addTransaction };
};

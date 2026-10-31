import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useDeleteTransaction = () => {
  const { isGuest } = useGetUserInfo();

  const deleteTransaction = async (id) => {
    if (isGuest) {
      try {
        const stored = JSON.parse(localStorage.getItem("guest_transactions") || "[]");
        const updated = stored.filter((t) => t.id !== id);
        localStorage.setItem("guest_transactions", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("guest_transactions_updated"));
      } catch (err) {
        console.error("Failed to delete guest transaction", err);
      }
      return;
    }

    try {
      const transactionDocRef = doc(db, "transactions", id);
      await deleteDoc(transactionDocRef);
    } catch (err) {
      console.error("Error deleting transaction: ", err);
    }
  };

  return { deleteTransaction };
};


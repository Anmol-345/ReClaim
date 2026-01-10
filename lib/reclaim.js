import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { isMatch } from "./matching";

export async function createReclaimRequest(baseItem, targetItem, userId) {
  if (!isMatch(baseItem, targetItem)) {
    throw new Error("Items do not match");
  }

  if (targetItem.userId === userId) {
    throw new Error("Cannot reclaim your own item");
  }

  await addDoc(collection(db, "reclaimRequests"), {
    baseItemId: baseItem.id,
    targetItemId: targetItem.id,
    requesterId: userId,
    ownerId: targetItem.userId,
    status: "pending",
    createdAt: serverTimestamp()
  });
}

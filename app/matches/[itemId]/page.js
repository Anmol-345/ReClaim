"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { useRouter } from "next/navigation";

import loader from "@/components/Loader";

export default function MatchDetailPage() {
  const { itemId: matchedItemId } = useParams();
  const searchParams = useSearchParams();
  const sourceItemId = searchParams.get("source");

  const [matchedItem, setMatchedItem] = useState(null);
  const [sourceItem, setSourceItem] = useState(null);

  const router = useRouter();

  const user = auth.currentUser;

  useEffect(() => {
    const loadItems = async () => {
      const matchedSnap = await getDoc(doc(db, "items", matchedItemId));
      const sourceSnap = await getDoc(doc(db, "items", sourceItemId));

      if (matchedSnap.exists()) {
        setMatchedItem({ id: matchedItemId, ...matchedSnap.data() });
      }
      if (sourceSnap.exists()) {
        setSourceItem({ id: sourceItemId, ...sourceSnap.data() });
      }
    };

    if (matchedItemId && sourceItemId) loadItems();
  }, [matchedItemId, sourceItemId]);

  const sendReclaimRequest = async () => {
    if (!user) {
      alert("Login required");
      return;
    }

    if (!matchedItem || !sourceItem) {
      alert("Invalid match context");
      return;
    }

    await addDoc(collection(db, "reclaimRequests"), {
      sourceItemId,
      targetItemId: matchedItemId,
      ownerId: matchedItem.userId,
      requesterId: user.uid,
      status: "pending",
      note: "",
      createdAt: serverTimestamp(),
    });

    alert("Reclaim request sent");
    router.push("/");
  };

  if (!matchedItem || !sourceItem) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex justify-center p-6">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[40%] border bg-gray-800 rounded-2xl p-8 space-y-6">

        <h2 className="text-2xl font-bold">Possible Match Found</h2>
        <p className="text-sm text-gray-400">
          Review both items carefully before requesting a reclaim.
        </p>

        <div className="border-t border-gray-700 pt-6 grid md:grid-cols-2 gap-6">

          {/* SOURCE ITEM */}
          <div className="border border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-lg">Your Item</h3>
            <img
              src={sourceItem.imageUrl}
              className="w-full h-56 object-cover rounded mb-3"
            />
            <p className="text-sm text-gray-300">
              {sourceItem.description}
            </p>
          </div>

          {/* MATCHED ITEM */}
          <div className="border border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-lg">Matched Item</h3>
            <img
              src={matchedItem.imageUrl}
              className="w-full h-56 object-cover rounded mb-3"
            />
            <p className="text-sm text-gray-300">
              {matchedItem.description}
            </p>
          </div>
        </div>

        {user?.uid !== matchedItem.userId && (
          <button
            onClick={sendReclaimRequest}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium"
          >
            Request Reclaim
          </button>
        )}
      </div>
    </div>
  );
}

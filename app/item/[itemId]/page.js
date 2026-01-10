"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { isMatch } from "@/lib/matching";
import { createReclaimRequest } from "@/lib/reclaim";
import loader from "@/components/Loader";

export default function ItemPage() {
  const { itemId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const baseId = searchParams.get("base");

  const [item, setItem] = useState(null);
  const [baseItem, setBaseItem] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "items", itemId));
      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() });
      }

      if (baseId) {
        const baseSnap = await getDoc(doc(db, "items", baseId));
        if (baseSnap.exists()) {
          setBaseItem({ id: baseSnap.id, ...baseSnap.data() });
        }
      }
    }

    load();
  }, [itemId, baseId]);

  if (!item) return <Loader/>;

  const canReclaim =
    user &&
    baseItem &&
    user.uid !== item.userId &&
    isMatch(baseItem, item);

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 py-10">
      {/* MAIN CONTAINER */}
      <div className="w-full md:w-[80%] lg:w-[70%] bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-semibold">{item.title}</h1>
        </div>

        {/* ITEM DETAILS */}
        <div className="px-6 py-6 border-b border-gray-700 space-y-4">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full max-h-[350px] object-cover rounded-lg"
          />

          <p className="text-gray-300">{item.description}</p>

          <p className="text-sm text-gray-400">
            Status: <span className="text-white">{item.type}</span>
          </p>

          {canReclaim && (
            <button
              onClick={() =>
                createReclaimRequest(baseItem, item, user.uid)
              }
              className="w-full mt-4 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg font-medium"
            >
              Request Reclaim
            </button>
          )}
        </div>

        {/* REPORT SECTION */}
        <div className="px-6 py-6 bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">
            Lost & Found Report
          </h2>

          <p className="text-sm text-gray-300 mb-4">
            If this item is related to a lost or found case, you can post a
            detailed report for better visibility.
          </p>

          <button
            onClick={() => router.push("/report")}
            className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium"
          >
            Post Lost / Found Report
          </button>
        </div>

      </div>
    </div>
  );
}

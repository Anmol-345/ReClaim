"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import loader from "@/components/Loader";

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      const baseSnap = await getDoc(doc(db, "items", itemId));
      if (!baseSnap.exists()) {
        setLoading(false);
        return;
      }

      const baseItem = baseSnap.data();
      const snap = await getDocs(collection(db, "items"));

      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(other => {
          if (other.id === itemId) return false;
          if (other.status !== "open") return false;
          if (other.type === baseItem.type) return false;
          if (other.itemType !== baseItem.itemType) return false;

          if (
            baseItem.primaryColor &&
            other.primaryColor &&
            baseItem.primaryColor !== other.primaryColor
          ) {
            return false;
          }

          return true;
        });

      setMatches(results);
      setLoading(false);
    };

    fetchMatches();
  }, [itemId]);

  if (!itemId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
          <p className="text-red-400 font-semibold">
            Invalid match request
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <loading/>;
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex items-center bg-[#020617] justify-center">
        <div className="bg-gray-900 text-white p-6 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold">No Matches Yet</h2>
          <p className="text-gray-400 mt-2">
            This does not mean your item won’t be found.
            Matches appear as more items are reported.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex justify-center py-10">
      <div className="w-[40%] bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold tracking-wide text-yellow-400">
            ⚠️ Possible Matches Found
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            These items are <strong>not confirmed</strong>.  
            They only share similar characteristics with your report.
          </p>
        </div>

        {/* INFO BANNER */}
        <div className="px-6 py-4 bg-yellow-900/30 border-b border-yellow-700">
          <p className="text-sm text-yellow-300">
            Review carefully before requesting a reclaim.  
            Owners will verify proof before approval.
          </p>
        </div>

        {/* MATCH LIST */}
        <div className="p-6 grid gap-4">
          {matches.map(item => (
            <div
              key={item.id}
              onClick={() =>
                router.push(`/matches/${item.id}?source=${itemId}`)
              }
              className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="text-xs uppercase text-gray-400">
                  {item.type}
                </span>
              </div>

              <div className="text-sm text-gray-400 mt-2">
                <p>Item Type: {item.itemType}</p>
                <p>Primary Color: {item.primaryColor || "Unknown"}</p>
              </div>

              <p className="mt-3 text-sm text-blue-400">
                Click to review & request reclaim →
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

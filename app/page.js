"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged,signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

import Loader from "@/components/Loader";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const router = useRouter();

  // Auth hydration
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  const handleLogout = async () => {
  await signOut(auth);
  router.push("/connect");
};


  // Fetch reclaim requests
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      const incomingQ = query(
        collection(db, "reclaimRequests"),
        where("ownerId", "==", user.uid)
      );

      const outgoingQ = query(
        collection(db, "reclaimRequests"),
        where("requesterId", "==", user.uid)
      );

      const [incomingSnap, outgoingSnap] = await Promise.all([
        getDocs(incomingQ),
        getDocs(outgoingQ),
      ]);

      setIncoming(incomingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setOutgoing(outgoingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchRequests();
  }, [user]);

  if (loading) return <Loader/>;

  if (!user) {
      router.push("/connect");
      return null;
  }

return (
  <div className="min-h-screen w-full bg-[#020617] text-white flex justify-center p-6">
    <div className="w-full max-w-full md:max-w-4xl lg:max-w-[40%] bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">

      {/* USER INFO */}
<div className="p-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-white">Welcome</h1>
    <p className="text-sm text-gray-400">{user.email}</p>
  </div>

  <button
    onClick={handleLogout}
    className="px-4 py-2 text-sm font-semibold rounded-lg
               bg-red-600 hover:bg-red-500 transition"
  >
    Logout
  </button>
</div>

      <hr className="border-gray-700" />

      {/* INCOMING REQUESTS */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-3 text-white">
          Incoming Reclaim Requests
        </h2>

        {incoming.length === 0 && (
          <p className="text-gray-400 text-sm">No incoming requests</p>
        )}

        {incoming.map(req => (
          <div
            key={req.id}
            className="border border-gray-700 rounded-lg p-4 mb-3 bg-[#020617]"
          >
            <p className="text-sm text-white">
              Status: <strong>{req.status}</strong>
            </p>

            {req.status === "pending" && (
              <button
                onClick={() => router.push(`/reclaim-verify/${req.id}`)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
              >
                Review Request
              </button>
            )}
          </div>
        ))}
      </div>

      <hr className="border-gray-700" />

      {/* OUTGOING REQUESTS */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-3 text-white">
          Your Reclaim Requests
        </h2>

        {outgoing.length === 0 && (
          <p className="text-gray-400 text-sm">No outgoing requests</p>
        )}

        {outgoing.map(req => (
          <div
            key={req.id}
            className="border border-gray-700 rounded-lg p-4 mb-3 bg-[#020617]"
          >
            <p className="text-sm text-white">
              Status: <strong>{req.status}</strong>
            </p>

            {req.status === "approved" && req.note && (
              <p className="mt-2 text-sm text-green-400">
                Owner note: {req.note}
              </p>
            )}
          </div>
        ))}
      </div>

      <hr className="border-gray-700" />

      {/* LOST / FOUND ACTION */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2 text-white">
          Lost or Found an Item?
        </h2>

        <p className="text-sm text-gray-400 mb-4 max-w-xl">
          Post a lost or found item so the right person can reclaim it securely.
        </p>

        <button
          onClick={() => router.push("/report")}
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center gap-2 font-semibold"
        >
          Post Lost / Found Item
        </button>
      </div>

    </div>
  </div>
);

}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import loader from "@/components/Loader";

export default function ReclaimVerifyPage() {
  const { requestId } = useParams();
  const router = useRouter();
  const user = auth.currentUser;

  const [request, setRequest] = useState(null);
  const [ownerItem, setOwnerItem] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId || !user) return;

    const fetchRequest = async () => {
      try {
        const reqSnap = await getDoc(doc(db, "reclaimRequests", requestId));
        if (!reqSnap.exists()) {
          alert("Request not found");
          router.push("/");
          return;
        }

        const reqData = { id: reqSnap.id, ...reqSnap.data() };
        setRequest(reqData);

        const itemSnap = await getDoc(doc(db, "items", reqData.targetItemId));
        if (itemSnap.exists()) {
          setOwnerItem({ id: itemSnap.id, ...itemSnap.data() });
        }

        setNote(reqData.note || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, user, router]);

  const canProceed = () => {
    if (!note.trim()) {
      alert("You must add a note before approving or rejecting!");
      return false;
    }
    return true;
  };

  const handleApprove = async () => {
    if (!canProceed()) return;

    await updateDoc(doc(db, "reclaimRequests", requestId), {
      status: "approved",
      note: note.trim(),
      approvedAt: serverTimestamp(),
    });

    router.push("/");
  };

  const handleReject = async () => {
    if (!canProceed()) return;

    await updateDoc(doc(db, "reclaimRequests", requestId), {
      status: "rejected",
      note: note.trim(),
      rejectedAt: serverTimestamp(),
    });

    router.push("/");
  };

  if (!user) return <p className="p-6 text-center">Login required</p>;
  if (loading) return <Loader/>;
  if (!request || !ownerItem) return <p className="p-6 text-center">Request not found</p>;
  if (request.ownerId !== user.uid) return <p className="p-6 text-center">Access denied</p>;

  return (
    <div className="min-h-screen bg-[#020617] flex justify-center py-10">
      <div className="w-full md:w-[80%] lg:w-[60%] bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Reclaim Verification</h2>
          <p className="text-sm text-gray-400">
            Verify the claimant before approving the request
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-6 space-y-6">

          {/* OWNER ITEM */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Item</h3>
            <div className="border border-gray-700 rounded-lg p-4 space-y-2">
              <img
                src={ownerItem.imageUrl}
                className="w-full rounded"
              />
              <p className="text-sm text-gray-300">{ownerItem.description}</p>
              <div className="text-sm text-gray-400">
                <p>Type: {ownerItem.itemType}</p>
                <p>Color: {ownerItem.primaryColor || "Unknown"}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* REQUEST DETAILS */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Request Details</h3>
            <div className="border border-gray-700 rounded-lg p-4 space-y-3">
              <p className="text-sm">
                Claimed by: <span className="text-gray-300">{request.requesterId}</span>
              </p>
              <p className="text-sm">
                Status: <strong className="capitalize">{request.status}</strong>
              </p>

              {request.status === "pending" && (
                <>
                  <label className="block text-sm font-semibold mt-3">
                    Note for claimant
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                    placeholder="Contact info, meeting point, verification detail…"
                  />
                </>
              )}

              {request.status !== "pending" && request.note && (
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-300">{request.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        {request.status === "pending" && (
          <div className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-end">
            <button
              onClick={handleReject}
              className="px-5 py-2 rounded bg-red-600 hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-5 py-2 rounded bg-green-600 hover:bg-green-700"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

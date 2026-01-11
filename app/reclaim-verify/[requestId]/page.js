"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Loader from "@/components/Loader";

export default function ReclaimVerifyPage() {
  const { requestId } = useParams();
  const router = useRouter();
  const user = auth.currentUser;

  const [request, setRequest] = useState(null);
  const [ownerItem, setOwnerItem] = useState(null);
  const [requesterItem, setRequesterItem] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId || !user) return;

    const loadData = async () => {
      try {
        // Fetch reclaim request
        const reqSnap = await getDoc(
          doc(db, "reclaimRequests", requestId)
        );

        if (!reqSnap.exists()) {
          router.push("/");
          return;
        }

        const reqData = { id: reqSnap.id, ...reqSnap.data() };
        setRequest(reqData);
        setNote(reqData.note || "");

        // Fetch owner's item
        const ownerSnap = await getDoc(
          doc(db, "items", reqData.targetItemId)
        );
        if (ownerSnap.exists()) {
          setOwnerItem({ id: ownerSnap.id, ...ownerSnap.data() });
        }

        // Fetch claimant's item
        const requesterSnap = await getDoc(
          doc(db, "items", reqData.sourceItemId)
        );
        if (requesterSnap.exists()) {
          setRequesterItem({
            id: requesterSnap.id,
            ...requesterSnap.data(),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [requestId, user, router]);

  const ensureNote = () => {
    if (!note.trim()) {
      alert("A note is required before approving or rejecting.");
      return false;
    }
    return true;
  };

  const approve = async () => {
    if (!ensureNote()) return;

    await updateDoc(doc(db, "reclaimRequests", requestId), {
      status: "approved",
      note: note.trim(),
      approvedAt: serverTimestamp(),
    });

    router.push("/");
  };

  const reject = async () => {
    if (!ensureNote()) return;

    await updateDoc(doc(db, "reclaimRequests", requestId), {
      status: "rejected",
      note: note.trim(),
      rejectedAt: serverTimestamp(),
    });

    router.push("/");
  };

  if (!user) return <p className="p-6 text-center">Login required</p>;
  if (loading) return <Loader />;
  if (!request || !ownerItem || !requesterItem)
    return <p className="p-6 text-center">Request not found</p>;
  if (request.ownerId !== user.uid)
    return <p className="p-6 text-center">Access denied</p>;

  return (
    <div className="min-h-screen bg-[#020617] flex justify-center py-10">
      <div className="w-full md:w-[80%] lg:w-[60%] bg-gray-800 text-white rounded-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Reclaim Verification</h2>
          <p className="text-sm text-gray-400">
            Review both items before taking action
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">

          {/* Owner Item */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Your Item</h3>
            <div className="border border-gray-700 rounded-lg p-4 space-y-2 bg-[#020617]">
              <img src={ownerItem.imageUrl} className="w-full rounded" />
              <p className="text-sm text-gray-300">
                {ownerItem.description}
              </p>
              <p className="text-sm text-gray-400">
                {ownerItem.itemType} • {ownerItem.primaryColor || "Unknown"}
              </p>
            </div>
          </section>

          {/* Claimant Item */}
          <section>
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">
              Claimant’s Item
            </h3>
            <div className="border border-gray-700 rounded-lg p-4 space-y-2 bg-[#020617]">
              <img src={requesterItem.imageUrl} className="w-full rounded" />
              <p className="text-sm text-gray-300">
                {requesterItem.description}
              </p>
              <p className="text-sm text-gray-400">
                {requesterItem.itemType} • {requesterItem.primaryColor || "Unknown"}
              </p>
              <p className="text-xs text-gray-500 italic">
                Reported as {requesterItem.type}
              </p>
            </div>
          </section>

          {/* Request Details */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Request Details</h3>
            <div className="border border-gray-700 rounded-lg p-4 space-y-3">
              {/* <p className="text-sm">
                Claimed by:{" "}
                <span className="text-gray-300">{request.requesterId}</span>
              </p> */}

              {request.status === "pending" && (
                <>
                  <label className="text-sm font-semibold">
                    Note for claimant
                  </label>
                  <br />
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 my-2 text-white"
                    placeholder="Contact info, verification detail, etc."
                  />
                </>
              )}

              {request.status !== "pending" && request.note && (
                <div className="bg-gray-800 p-3 rounded text-sm">
                  {request.note}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Actions */}
        {request.status === "pending" && (
          <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={reject}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Reject
            </button>
            <button
              onClick={approve}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

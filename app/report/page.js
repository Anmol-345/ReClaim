"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import loader from "@/components/Loader";

export default function ReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("lost");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [aiMetaData, setAiMetaData] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setAiMetaData(null);

    try {
      if (!title || !description || !imageFile) {
        throw new Error("All fields are required");
      }

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.secure_url;

      const aiRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const { aiMetaData } = await aiRes.json();

      const docRef = await addDoc(collection(db, "items"), {
        title,
        description,
        imageUrl,
        type,
        status: "open",
        itemType: aiMetaData.itemType,
        primaryColor: aiMetaData.primaryColor,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      router.push(`/matches?itemId=${docRef.id}`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white flex justify-center p-6">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[40%] border bg-gray-800 rounded-2xl p-8">

        <h1 className="text-2xl font-bold mb-2">
          Report Lost or Found Item
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Upload details of a lost or found item to help it reach the right owner.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title"
            className="w-full p-3 rounded bg-[#020617] border border-gray-700 text-white placeholder-gray-400"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item (marks, location, time, etc.)"
            rows={4}
            className="w-full p-3 rounded bg-[#020617] border border-gray-700 text-white placeholder-gray-400"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded bg-[#020617] border border-gray-700 text-white"
          >
            <option value="lost">Lost Item</option>
            <option value="found">Found Item</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-400"
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium"
          >
            {loading ? "Processing..." : "Submit Report"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-red-400 text-sm">{message}</p>
        )}

        {aiMetaData && (
          <div className="mt-6 border border-gray-700 rounded-lg p-4">
            <p className="text-sm">
              <strong>Detected Item:</strong> {aiMetaData.itemType}
            </p>
            <p className="text-sm">
              <strong>Primary Color:</strong> {aiMetaData.primaryColor}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

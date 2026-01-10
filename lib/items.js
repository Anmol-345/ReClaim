import { getAuth } from "firebase/auth";

export async function createItemWithAI({ title, description, type, imageFile }) {
  if (!title || !description || !type || !imageFile) {
    throw new Error("Missing required fields");
  }

  // 1️⃣ Get current user
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid || "anonymous";

  // 2️⃣ Upload image to Cloudinary
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", "YOUR_CLOUDINARY_PRESET"); // replace with yours

  const cloudRes = await fetch(
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
    { method: "POST", body: formData }
  );

  if (!cloudRes.ok) {
    throw new Error("Image upload failed");
  }

  const cloudData = await cloudRes.json();
  const imageUrl = cloudData.secure_url;

  // 3️⃣ Call your API route to get AI metadata
  const aiRes = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, title, description, type, userId }),
  });

  const aiData = await aiRes.json();
  if (!aiRes.ok || !aiData.aiMetaData) {
    console.warn("AI metadata not available, using defaults");
  }

  // 4️⃣ Return combined data
  return {
    title,
    description,
    type,
    imageUrl,
    userId,
    aiMetaData: aiData.aiMetaData || { itemType: type, primaryColor: "unknown" },
  };
}

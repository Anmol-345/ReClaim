import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl missing" },
        { status: 400 }
      );
    }

    // Fetch image
    const imageResp = await fetch(imageUrl);
    const contentType =
      imageResp.headers.get("content-type") || "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
Identify the item and its primary color.
Return ONLY valid JSON like this:
{
  "itemType": "wallet",
  "primaryColor": "brown"
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: contentType, // ✅ dynamic MIME type
        },
      },
    ]);

    const text = result.response.text();

    let aiMetaData = {
      itemType: "unknown",
      primaryColor: "unknown",
    };

    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      aiMetaData = {
        itemType: parsed.itemType || "unknown",
        primaryColor: parsed.primaryColor || "unknown",
      };
    } catch {
      // fallback already set
    }

    return NextResponse.json({ aiMetaData });

  } catch (err) {
    console.error("Gemini Error:", err);
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}

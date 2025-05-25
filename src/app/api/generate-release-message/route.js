// app/api/generate-release-message/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: { temperature: 0.7 },
    });

    const prompt = `
      Generate an exciting, celebratory message for when a fan-made GTA VI countdown timer reaches zero.
      The game is set in Leonida (fictional Florida). The tone should be hyped, like an in-game announcement or a triumphant fan exclamation.
      Keep it relatively short, 1-2 sentences.
      Examples:
      - "The moment has arrived! Leonida's chaos is unleashed! Get ready to dive in!"
      - "Lights, camera, action! Vice City and beyond are officially open for business (and mayhem)!"
      - "The wait is finally over! Leonida's calling your name - answer it!"
      - "Lock and load, citizens! The gates to Leonida have swung wide open! Time to make your mark."

      Return ONLY the message.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Error in /api/generate-release-message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate release message." },
      { status: 500 }
    );
  }
}

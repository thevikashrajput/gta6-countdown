// app/api/generate-rumor/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return NextResponse.json(
        { error: "API key not configured on server." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    }); // Or your preferred model

    const prompt = `Generate a short, fun, and intriguing fan-made rumor about the upcoming game GTA VI, specifically set in Leonida (a fictionalized Florida). Make it sound like something a fan might excitedly speculate or hear on an in-game radio station. Keep it concise, ideally one or two sentences. For example: "Heard they're adding rideable alligators in the Glades!" or "Someone spotted a hidden UFO base deep in the Vice City swamps."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ rumor: text.trim() });
  } catch (error) {
    console.error("Error in /api/generate-rumor (server-side):", error);
    let errorMessage = "Failed to generate rumor from API.";
    if (
      error.message &&
      (error.message.toLowerCase().includes("api key not valid") ||
        error.message.toLowerCase().includes("invalid api key"))
    ) {
      errorMessage = "Failed to generate rumor: Invalid API Key (server).";
    } else if (error.message && error.message.toLowerCase().includes("quota")) {
      errorMessage = "Failed to generate rumor: API quota likely exceeded.";
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

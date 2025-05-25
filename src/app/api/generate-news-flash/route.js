// app/api/generate-news-flash/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const revalidate = 0; // Ensure dynamic responses

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: { temperature: 0.8 },
    });

    const prompt = `
      Generate 3 to 5 very short, punchy, and intriguing "news ticker" headlines supposedly from Weazel News in GTA VI's Leonida (fictional Florida).
      They should sound like quick updates a player might see scrolling on screen. Keep them diverse: crime, weird events, celebrity gossip, business, weather oddities.
      Each headline must be a single, concise sentence fragment or short sentence. No more than 10-15 words each.
      Examples:
      - "Police chase shuts down Vice Keys bridge..."
      - "Gator sightings up 200% in the Glades!"
      - "Stocks plummet for Pisswasser after recall..."
      - "Another influencer arrested at Vice Beach hotspot..."
      - "Hurricane Cholo forming off the coast..."
      - "Flying car spotted over downtown Port Gellhorn?"

      Return ONLY the headlines, each on a new line. Do not include any other text, numbering, or introduction.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const flashes = text
      .split("\n")
      .map((flash) => flash.trim())
      .filter((flash) => flash.length > 0);

    return NextResponse.json({ flashes });
  } catch (error) {
    console.error("Error in /api/generate-news-flash:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate news flashes." },
      { status: 500 }
    );
  }
}

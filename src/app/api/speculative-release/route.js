// app/api/speculative-release/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ensures the route is dynamic and not cached.
export const revalidate = 0;
// export const dynamic = 'force-dynamic'; // Alternative

export async function GET(request) {
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

    const generationConfig = {
      temperature: 0.85, // Let's try 0.85; 0.9 might be too high if it's still struggling with specifics.
      // Feel free to adjust this between 0.7 and 1.0.
      // topP: 0.95,
      // topK: 40,
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // Or "gemini-pro" if flash is too constrained for variety
      generationConfig: generationConfig,
    });

    // --- REVISED AND MORE DIRECTIVE PROMPT ---
    const prompt = `
      You are a creative content generator for a GTA VI fan website.
      Your task is to generate a very short, exciting, and distinct "speculative release confirmation" or "hot tip" about GTA VI's launch.
      The absolutely CRITICAL information is that the targeted release date is May 26th, 2026. It MUST be May 26th, 2026. Do NOT use May 25th or any other date.

      Each generated phrase must:
      1.  Clearly and unmistakably point to **May 26th, 2026**.
      2.  Sound like an in-universe radio announcement, a leaked intel snippet, a top-secret memo fragment, a cryptic graffiti message, or a confident fan theory.
      3.  Be **significantly different** in phrasing, tone, and structure from previous outputs. Avoid any repetitive sentence starters or core phrases. Be highly creative and diverse.
      4.  Be brief (1-2 sentences typically) and punchy. No extra commentary.

      Here are examples of the desired style, variety, and date accuracy:

      *   Example 1 (Radio Announcer): "BREAKING NEWS from the Vice City wire! Mark your calendars, folks – Leonida's gates swing wide May 26th, twenty twenty-six!"
      *   Example 2 (Leaked Intel): "CLASSIFIED // Source Alpha confirms: Project Leonida greenlit for 05-26-2026. Prepare for chaos."
      *   Example 3 (Fan Theory): "I've cracked the code! All signs point to Vice City's return on May twenty-sixth, '26! It's happening!"
      *   Example 4 (Cryptic Hint): "Heard a whisper down at the docks... 'The heat arrives May 26, 2026.' You didn't hear it from me."
      *   Example 5 (Short & Punchy): "Leonida launch sequence initiated: T-minus until May 26th, 2026!"
      *   Example 6 (Memo Fragment): "...all units mobilize. Target date: May 26, 2026. No delays."

      Generate a new, unique phrase now adhering to all these rules, especially the date May 26th, 2026 and the need for variety.
    `;
    // --- END OF REVISED PROMPT ---

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check for safety ratings or blocked content, which might indicate an issue with the prompt or generation
    if (response.promptFeedback && response.promptFeedback.blockReason) {
      console.warn(
        "Prompt was blocked:",
        response.promptFeedback.blockReason,
        response.promptFeedback.safetyRatings
      );
      return NextResponse.json(
        {
          error: `Content generation blocked due to: ${response.promptFeedback.blockReason}. Please adjust the prompt.`,
        },
        { status: 400 } // Bad Request, as the prompt might be the issue
      );
    }

    if (
      !response.candidates ||
      !response.candidates[0] ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      !response.candidates[0].content.parts[0].text
    ) {
      console.error("Unexpected response structure from Gemini:", response);
      // Check if content was filtered due to safety
      if (
        response.candidates &&
        response.candidates[0] &&
        response.candidates[0].finishReason === "SAFETY"
      ) {
        return NextResponse.json(
          {
            error:
              "Generated content was blocked due to safety settings. Try a different prompt or adjust safety settings if possible.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Failed to generate text or received an empty response from the model.",
        },
        { status: 500 }
      );
    }

    const text = response.text(); // Uses the built-in text() getter

    console.log("Generated speculative text:", text.trim()); // For server-side logging

    return NextResponse.json({ speculativeText: text.trim() });
  } catch (error) {
    console.error("Error in /api/speculative-release (server-side):", error);
    let errorMessage = "Could not fetch speculative release info.";
    let statusCode = 500;

    if (error.message) {
      if (
        error.message.toLowerCase().includes("api key not valid") ||
        error.message.toLowerCase().includes("invalid api key")
      ) {
        errorMessage = "Speculative info error: Invalid API Key (server).";
      } else if (error.message.toLowerCase().includes("quota")) {
        errorMessage = "Speculative info error: API quota likely exceeded.";
        statusCode = 429; // Too Many Requests
      } else if (
        error.message.toLowerCase().includes("candidate_was_blocked") ||
        error.message.toLowerCase().includes("safety")
      ) {
        errorMessage =
          "Speculative info error: Content generation blocked due to safety settings. Try rephrasing your prompt.";
        // Log the full error for details if this occurs
        console.error(
          "Gemini content generation blocked:",
          error.response?.promptFeedback || error
        );
        statusCode = 400; // Bad Request (prompt issue) or 500
      } else if (
        error.message.toLowerCase().includes("resource has been exhausted")
      ) {
        errorMessage =
          "Speculative info error: API quota likely exceeded (Resource exhausted).";
        statusCode = 429;
      } else if (error.message.toLowerCase().includes("model_not_found")) {
        errorMessage =
          "Speculative info error: The specified model could not be found.";
        statusCode = 404;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

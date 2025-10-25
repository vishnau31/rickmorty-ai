import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { character } = await req.json();

    if (!character || !character.name) {
      return NextResponse.json(
        { error: "Character data is required" },
        { status: 400 }
      );
    }

    // Generate AI insight prompt
    const prompt = `You are an expert analyst studying characters from Rick and Morty. Generate a brief but insightful character analysis.

Character Details:
- Name: ${character.name}
- Species: ${character.species}
- Status: ${character.status}

Provide a 2-3 sentence AI-powered insight about this character that includes:
1. A personality observation or character trait
2. A theory or interesting fact about them
3. Their role or significance in the show

Keep it concise, engaging, and in the analytical tone of a Rick & Morty fan wiki.`;

    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    });

    return NextResponse.json({
      insight: text,
      character: character.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating character insight:", error);
    return NextResponse.json(
      { error: "Failed to generate insight. Check your API configuration." },
      { status: 500 }
    );
  }
}


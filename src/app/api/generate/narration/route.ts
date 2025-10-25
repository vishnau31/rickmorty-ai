import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Types for location data from GraphQL
interface Resident {
  id: string;
  name: string;
  status: string;
  species: string;
  image: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
  dimension: string;
  residents: Resident[];
}

export async function POST(req: NextRequest) {
  try {
    const { location } = await req.json() as { location: Location };

    if (!location) {
      return NextResponse.json(
        { error: "Location data is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file" },
        { status: 500 }
      );
    }

    console.log('Generating narration for:', location.name);

    const residentSummary = location.residents.length > 0
      ? location.residents.slice(0, 5).map((r) => 
          `${r.name} (${r.species}, ${r.status})`
        ).join(", ")
      : "No known residents";

    const moreResidents = location.residents.length > 5 
      ? ` and ${location.residents.length - 5} more`
      : "";

    const prompt = `You are a narrator in the style of Rick Sanchez from Rick and Morty. Generate a brief, cynical, and darkly humorous narration about the following interdimensional location.

      Location Details:
      - Name: ${location.name}
      - Type: ${location.type}
      - Dimension: ${location.dimension}
      - Notable Residents: ${residentSummary}${moreResidents}

      Requirements:
      - Keep it under 100 words
      - Use Rick's characteristic cynicism, sci-fi jargon, and dark humor
      - Include references to interdimensional travel, multiverse theory, or scientific absurdity
      - Make it entertaining and accurate to the location's actual details
      - Use phrases like "burp", "Morty", casual profanity (keep it mild), and existential observations
      - DO NOT make up facts not provided above

      Generate the narration now:`;

    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      prompt,
      temperature: 0.8,
    });

    console.log('Narration generated successfully, length:', text.length);

    return NextResponse.json({
      output: text,
      location: location.name,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Error generating narration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate narration" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { evaluateNarration, quickEvaluate } from "@/lib/evaluator";

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
    const { narration, location, mode } = await req.json() as {
      narration: string;
      location: Location;
      mode?: "quick" | "full";
    };

    if (!narration || !location) {
      return NextResponse.json(
        { error: "Narration and location data are required" },
        { status: 400 }
      );
    }

    console.log('Evaluating narration for:', location.name, 'mode:', mode || 'full');

    const evaluationMode = mode || "full";
    
    let result;
    if (evaluationMode === "quick") {
      result = quickEvaluate(narration, location);
    } else {
      if (!process.env.OPENAI_API_KEY) {
        console.log('No API key, falling back to quick evaluation');
        result = quickEvaluate(narration, location);
        result.feedback = "OpenAI API key not configured. Using quick evaluation mode.";
      } else {
        result = await evaluateNarration(narration, location);
      }
    }

    console.log('Evaluation complete, overall score:', result.scores.overall);

    return NextResponse.json({
      ...result,
      mode: evaluationMode,
      location: location.name,
    });

  } catch (error: any) {
    console.error("Error evaluating narration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate narration" },
      { status: 500 }
    );
  }
}


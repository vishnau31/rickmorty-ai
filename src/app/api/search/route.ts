import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 5 } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log('Searching for:', query);

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    const { data, error } = await supabase.rpc('search_characters', {
      query_embedding: embedding,
      match_count: limit,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        { error: `Search failed: ${error.message}` },
        { status: 500 }
      );
    }

    const results = data || [];
    console.log('Found', results.length, 'matching characters');

    return NextResponse.json({
      query,
      results: results.map((r: any) => ({
        characterId: r.character_id,
        characterName: r.character_name,
        similarity: r.similarity,
      })),
      count: results.length,
    });
  } catch (error: any) {
    console.error("Error searching characters:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search characters" },
      { status: 500 }
    );
  }
}


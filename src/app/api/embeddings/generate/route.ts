import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  try {
    const { character } = await req.json();

    if (!character || !character.id || !character.name) {
      return NextResponse.json(
        { error: "Character data with id and name is required" },
        { status: 400 }
      );
    }

    const characterText = `
Character: ${character.name}
Species: ${character.species || 'Unknown'}
Status: ${character.status || 'Unknown'}
Type: ${character.type || 'Regular character'}
Gender: ${character.gender || 'Unknown'}
Origin: ${character.origin?.name || 'Unknown'}
Location: ${character.location?.name || 'Unknown'}
    `.trim();

    console.log('Generating embedding for:', character.name);

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: characterText,
    });

    const { error } = await supabase
      .from('character_embeddings')
      .upsert({
        character_id: character.id,
        character_name: character.name,
        embedding: embedding,
      }, {
        onConflict: 'character_id'
      });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: `Failed to store embedding: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Embedding stored for:', character.name);

    return NextResponse.json({
      success: true,
      characterId: character.id,
      characterName: character.name,
      embeddingDimension: embedding.length,
    });
  } catch (error: any) {
    console.error("Error generating embedding:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate embedding" },
      { status: 500 }
    );
  }
}


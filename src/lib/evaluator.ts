/**
 * Evaluation utilities for Rick & Morty narration quality assessment
 * Implements both heuristic and LLM-based evaluation metrics
 */

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Types
export interface EvaluationScores {
  factualConsistency: number;
  toneMatch: number;
  creativity: number;
  completeness: number;
  overall: number;
}

export interface EvaluationResult {
  scores: EvaluationScores;
  feedback: string;
  timestamp: string;
}

interface Location {
  name: string;
  type: string;
  dimension: string;
  residents: Array<{ name: string; species: string; status: string }>;
}

/**
 * Heuristic Evaluation - Fast, deterministic scoring
 * Uses pattern matching and keyword analysis
 */
export function heuristicEvaluation(
  narration: string,
  location: Location
): Pick<EvaluationScores, "factualConsistency" | "toneMatch" | "completeness"> {
  // 1. Factual Consistency Score (0-100)
  let factualScore = 0;
  const narrationLower = narration.toLowerCase();
  
  // Check if location name is mentioned (40 points)
  if (narrationLower.includes(location.name.toLowerCase())) {
    factualScore += 40;
  }
  
  // Check if type is mentioned (20 points)
  if (location.type && narrationLower.includes(location.type.toLowerCase())) {
    factualScore += 20;
  }
  
  // Check if dimension is mentioned (20 points)
  if (location.dimension && narrationLower.includes(location.dimension.toLowerCase())) {
    factualScore += 20;
  }
  
  // Check if residents are mentioned (20 points)
  const residentsMentioned = location.residents.filter(r =>
    narrationLower.includes(r.name.toLowerCase())
  ).length;
  if (residentsMentioned > 0) {
    factualScore += Math.min(20, residentsMentioned * 10);
  }

  // 2. Tone Match Score (0-100) - Rick Sanchez style indicators
  let toneScore = 0;
  
  // Rick-style indicators (each worth points)
  const toneIndicators = [
    { pattern: /\b(morty|jeez|geez)\b/i, points: 15, name: "Morty reference" },
    { pattern: /\b(burp|belch)\b/i, points: 10, name: "Burp" },
    { pattern: /\b(dimension|multiverse|universe|reality|portal)\b/i, points: 15, name: "Sci-fi jargon" },
    { pattern: /\b(stupid|dumb|idiot|moron|pathetic)\b/i, points: 10, name: "Cynicism" },
    { pattern: /\b(science|quantum|molecular|cosmic|inter-dimensional)\b/i, points: 15, name: "Scientific terms" },
    { pattern: /\b(nobody cares|doesn't matter|pointless|meaningless|who cares)\b/i, points: 15, name: "Nihilism" },
    { pattern: /\b(grandpa|grandson|family)\b/i, points: 10, name: "Family references" },
    { pattern: /[.!?]\s+[A-Z].*[.!?]\s+[A-Z]/g, points: 10, name: "Multiple sentences" }, // Coherent structure
  ];
  
  toneIndicators.forEach(({ pattern, points }) => {
    if (pattern.test(narration)) {
      toneScore += points;
    }
  });
  
  toneScore = Math.min(100, toneScore); // Cap at 100

  // 3. Completeness Score (0-100)
  const wordCount = narration.split(/\s+/).length;
  let completenessScore = 0;
  
  // Ideal: 50-150 words
  if (wordCount < 30) {
    completenessScore = (wordCount / 30) * 50; // Too short
  } else if (wordCount >= 30 && wordCount <= 150) {
    completenessScore = 100; // Perfect range
  } else if (wordCount > 150) {
    completenessScore = Math.max(50, 100 - ((wordCount - 150) / 2)); // Too long
  }

  // Check if it has proper structure (beginning, middle, end)
  const sentenceCount = narration.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  if (sentenceCount >= 2) {
    completenessScore = Math.min(100, completenessScore + 10);
  }

  return {
    factualConsistency: Math.round(factualScore),
    toneMatch: Math.round(toneScore),
    completeness: Math.round(completenessScore),
  };
}

/**
 * LLM-as-Judge Evaluation - Comprehensive, nuanced scoring
 * Uses GPT to evaluate creativity and provide detailed feedback
 */
export async function llmEvaluation(
  narration: string,
  location: Location
): Promise<Pick<EvaluationScores, "creativity"> & { feedback: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const evaluationPrompt = `You are an expert evaluator of creative writing, specifically for Rick & Morty style content.

Evaluate the following narration for CREATIVITY only on a scale of 0-100:

**Narration to evaluate:**
"${narration}"

**Context:**
- Location: ${location.name}
- Type: ${location.type}
- Dimension: ${location.dimension}

**Creativity Criteria (0-100):**
- Originality: Unique perspective or jokes (not generic)
- Humor Quality: Actually funny, clever wordplay
- Unexpected Elements: Surprising observations or connections
- Entertainment Value: Engaging and memorable

**IMPORTANT:** 
- Score 80-100: Exceptional, genuinely creative and hilarious
- Score 60-79: Good, solid creativity with some unique elements
- Score 40-59: Average, somewhat creative but predictable
- Score 20-39: Below average, mostly generic
- Score 0-19: Poor, no creativity or very generic

Respond in this EXACT format:
CREATIVITY_SCORE: [number 0-100]
FEEDBACK: [2-3 sentences explaining the score, focusing on what works and what could be improved]`;

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      prompt: evaluationPrompt,
      temperature: 0.3, // Lower temperature for consistent evaluation
    });

    // Parse the response
    const scoreMatch = text.match(/CREATIVITY_SCORE:\s*(\d+)/);
    const feedbackMatch = text.match(/FEEDBACK:\s*(.+)/);

    const creativity = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Evaluation completed.";

    return {
      creativity,
      feedback,
    };
  } catch (error) {
    console.error("LLM evaluation error:", error);
    // Fallback to heuristic-based creativity score
    const wordCount = narration.split(/\s+/).length;
    const hasHumor = /\b(haha|lol|funny|hilarious)\b/i.test(narration);
    const creativityFallback = Math.min(100, wordCount + (hasHumor ? 20 : 0));
    
    return {
      creativity: creativityFallback,
      feedback: "LLM evaluation unavailable. Using fallback heuristic scoring.",
    };
  }
}

/**
 * Complete Evaluation - Combines heuristic and LLM evaluation
 */
export async function evaluateNarration(
  narration: string,
  location: Location
): Promise<EvaluationResult> {
  // Run heuristic evaluation (fast)
  const heuristicScores = heuristicEvaluation(narration, location);

  // Run LLM evaluation (slower, more nuanced)
  const llmResult = await llmEvaluation(narration, location);

  // Calculate overall score (weighted average)
  const scores: EvaluationScores = {
    factualConsistency: heuristicScores.factualConsistency,
    toneMatch: heuristicScores.toneMatch,
    creativity: llmResult.creativity,
    completeness: heuristicScores.completeness,
    overall: Math.round(
      (heuristicScores.factualConsistency * 0.3 +
        heuristicScores.toneMatch * 0.3 +
        llmResult.creativity * 0.25 +
        heuristicScores.completeness * 0.15)
    ),
  };

  return {
    scores,
    feedback: llmResult.feedback,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Quick heuristic-only evaluation (for fast feedback)
 */
export function quickEvaluate(narration: string, location: Location): EvaluationResult {
  const heuristicScores = heuristicEvaluation(narration, location);
  
  // Simple creativity heuristic (no LLM)
  const wordVariety = new Set(narration.toLowerCase().split(/\W+/)).size;
  const creativity = Math.min(100, Math.round((wordVariety / narration.split(/\s+/).length) * 150));

  const scores: EvaluationScores = {
    ...heuristicScores,
    creativity,
    overall: Math.round(
      (heuristicScores.factualConsistency * 0.3 +
        heuristicScores.toneMatch * 0.3 +
        creativity * 0.25 +
        heuristicScores.completeness * 0.15)
    ),
  };

  return {
    scores,
    feedback: "Quick heuristic evaluation completed. For detailed feedback, use full evaluation.",
    timestamp: new Date().toISOString(),
  };
}


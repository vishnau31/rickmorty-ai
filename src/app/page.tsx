"use client";
import { useQuery } from "@apollo/client/react";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_LOCATIONS } from "../graphql/queries";
import { useState } from "react";
import LocationCard from "@/components/LocationCard";
import NarrationModal from "@/components/NarrationModal";
import CharacterModal from "@/components/CharacterModal";
import SemanticSearch from "@/components/SemanticSearch";

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

interface LocationsData {
  locations: {
    results: Location[];
  };
}

interface EvaluationScores {
  factualConsistency: number;
  toneMatch: number;
  creativity: number;
  completeness: number;
  overall: number;
}

export default function Home() {
  const { data, loading, error } = useQuery<LocationsData>(GET_LOCATIONS, { client: graphqlClient });
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [narration, setNarration] = useState<{ 
    text: string; 
    location: string;
    locationData?: Location;
    evaluation?: EvaluationScores;
    feedback?: string;
  } | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Resident | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-600 text-lg">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 text-center">
            <span className="text-2xl block mb-2">!</span>
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const generateNarration = async (location: Location) => {
    setGeneratingId(location.id);
    try {
      const res = await fetch("/api/generate/narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      const json = await res.json();
      
      if (res.ok && json.output) {
        setNarration({ 
          text: json.output, 
          location: location.name,
          locationData: location
        });
      } else {
        alert(json.error || "Failed to generate narration");
      }
    } catch (err) {
      alert("Failed to generate narration. Make sure your API key is configured in .env.local");
    } finally {
      setGeneratingId(null);
    }
  };

  const runFullEvaluation = async () => {
    if (!narration || !narration.locationData) return;
    
    setEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          narration: narration.text,
          location: narration.locationData,
          mode: "full" // Request full LLM evaluation
        }),
      });
      const json = await res.json();
      
      if (res.ok) {
        setNarration({
          ...narration,
          evaluation: json.scores,
          feedback: json.feedback
        });
      } else {
        alert(json.error || "Failed to evaluate narration");
      }
    } catch (err) {
      alert("Failed to evaluate narration. Make sure your API key is configured.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleSearchSelect = (characterId: string, characterName: string) => {
    // Find the character in our data
    const allCharacters: Resident[] = [];
    data?.locations?.results?.forEach((loc: Location) => {
      loc.residents.forEach((char: Resident) => {
        if (char.id === characterId) {
          allCharacters.push(char);
        }
      });
    });

    if (allCharacters.length > 0) {
      setSelectedCharacter(allCharacters[0]);
    } else {
      // Create a minimal character object if not found in current data
      setSelectedCharacter({
        id: characterId,
        name: characterName,
        status: 'Unknown',
        species: 'Unknown',
        image: 'https://rickandmortyapi.com/api/character/avatar/19.jpeg', // Fallback image
      });
    }
  };

  return (
    <>
      {/* Narration Modal */}
      {narration && (
        <NarrationModal
          narration={narration}
          evaluating={evaluating}
          onClose={() => setNarration(null)}
          onEvaluate={runFullEvaluation}
        />
      )}

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden bg-gray-50 border-b border-gray-200">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900">
                Rick & Morty Explorer
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 mt-2">
                Discover Locations with AI-Powered Storytelling
              </h2>
            </div>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
              Explore the multiverse and let AI narrate each location in Rick's signature style
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span>{data?.locations?.results?.length || 0} locations available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-8">
        <SemanticSearch onCharacterSelect={handleSearchSelect} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.locations?.results?.map((loc: Location, index: number) => (
            <LocationCard
              key={loc.id}
              location={loc}
              index={index}
              isGenerating={generatingId === loc.id}
              onGenerateNarration={generateNarration}
              onCharacterClick={(char) => setSelectedCharacter(char)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            Powered by Rick and Morty API • Advanced AI Narration • Real-time Search
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

import { useState } from 'react';

interface SearchResult {
  characterId: string;
  characterName: string;
  similarity: number;
}

interface SemanticSearchProps {
  onCharacterSelect: (characterId: string, characterName: string) => void;
}

export default function SemanticSearch({ onCharacterSelect }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 8 }),
      });

      const json = await res.json();

      if (res.ok) {
        setResults(json.results);
        if (json.results.length === 0) {
          setError('No characters found. Try indexing characters first.');
        }
      } else {
        setError(json.error || 'Search failed');
      }
    } catch (err) {
      setError('Failed to search. Make sure your API key is configured.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Find Characters</h3>
          <p className="text-sm text-gray-600">Search by personality, species, or any trait</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters (e.g., 'scientist with green skin')"
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searching ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}
      </form>

      {results.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">
            {results.length} {results.length === 1 ? 'character' : 'characters'} found
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {results.map((result) => (
              <button
                key={result.characterId}
                onClick={() => onCharacterSelect(result.characterId, result.characterName)}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                    {result.characterName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(result.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${result.similarity * 100}%` }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

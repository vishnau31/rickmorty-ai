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

interface LocationCardProps {
  location: Location;
  index: number;
  isGenerating: boolean;
  onGenerateNarration: (location: Location) => void;
  onCharacterClick?: (character: Resident) => void;
}

export default function LocationCard({
  location,
  index,
  isGenerating,
  onGenerateNarration,
  onCharacterClick,
}: LocationCardProps) {
  return (
    <div
      className="group bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {location.name}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-gray-600">
              <span className="font-medium">Type:</span> {location.type}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">
              <span className="font-medium">Dimension:</span>{" "}
              {location.dimension}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Residents ({location.residents.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {location.residents.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="relative group/resident cursor-pointer"
                title={`${r.name} - ${r.species} (${r.status})`}
                onClick={() => onCharacterClick?.(r)}
              >
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-14 h-14 rounded-full border-2 border-gray-300 group-hover/resident:border-blue-500 transition-all duration-200 hover:scale-110"
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    r.status === "Alive"
                      ? "bg-green-500"
                      : r.status === "Dead"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                ></span>
              </div>
            ))}
            {location.residents.length > 6 && (
              <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600">
                +{location.residents.length - 6}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onGenerateNarration(location)}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
              Generating...
            </>
          ) : (
            "Generate Narration"
          )}
        </button>
      </div>
    </div>
  );
}

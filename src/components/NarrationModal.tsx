interface EvaluationScores {
  factualConsistency: number;
  toneMatch: number;
  creativity: number;
  completeness: number;
  overall: number;
}

interface NarrationModalProps {
  narration: {
    text: string;
    location: string;
    evaluation?: EvaluationScores;
    feedback?: string;
  };
  evaluating: boolean;
  onClose: () => void;
  onEvaluate: () => void;
}

export default function NarrationModal({
  narration,
  evaluating,
  onClose,
  onEvaluate,
}: NarrationModalProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(narration.text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Location Story</h3>
            <p className="text-sm text-gray-600">{narration.location}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
              {narration.text}
            </p>
          </div>

          {!narration.evaluation ? (
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-200 text-center">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Evaluate Story Quality
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get AI-powered quality analysis
                  </p>
                </div>
                <button
                  onClick={onEvaluate}
                  disabled={evaluating}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {evaluating ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      Evaluating...
                    </>
                  ) : (
                    "Analyze Quality"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">Quality Analysis</h4>
                <span className="text-2xl font-bold text-blue-600">
                  {narration.evaluation.overall}/100
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Accuracy", value: narration.evaluation.factualConsistency },
                  { label: "Style Match", value: narration.evaluation.toneMatch },
                  { label: "Creativity", value: narration.evaluation.creativity },
                  { label: "Completeness", value: narration.evaluation.completeness },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{metric.label}</span>
                      <span className="text-gray-600">{metric.value}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          metric.value >= 80
                            ? "bg-green-500"
                            : metric.value >= 60
                            ? "bg-blue-500"
                            : metric.value >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {narration.feedback && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Feedback: </span>
                    {narration.feedback}
                  </p>
                </div>
              )}

              <button
                onClick={onEvaluate}
                disabled={evaluating}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {evaluating ? "Re-evaluating..." : "Re-analyze"}
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Copy Story
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

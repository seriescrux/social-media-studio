"use client";

interface Props {
  idea: string;
  isLoading: boolean;
  onIdeaChange: (value: string) => void;
  onGenerate: () => void;
}

export default function IdeaInput({
  idea,
  isLoading,
  onIdeaChange,
  onGenerate,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={idea}
        onChange={(e) => onIdeaChange(e.target.value)}
        placeholder="e.g. Carousel about why kids forget what they learn — explain the forgetting curve — end with how spaced repetition fixes it"
        rows={4}
        className="w-full px-4 py-3 text-sm rounded-lg resize-none"
        style={{
          border: "1px solid #d1d5db",
          color: "#111827",
          outline: "none",
          backgroundColor: "#ffffff",
        }}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !idea.trim()}
        style={{
          backgroundColor: isLoading || !idea.trim() ? "#fdba8c" : "#FF6B35",
          color: "#ffffff",
          cursor: isLoading || !idea.trim() ? "not-allowed" : "pointer",
          border: "none",
        }}
        className="w-full py-3 rounded-lg font-medium text-sm transition-all"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate"
        )}
      </button>
    </div>
  );
}
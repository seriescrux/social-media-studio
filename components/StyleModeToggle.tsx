"use client";

import { StyleMode } from "@/lib/schema";

interface Props {
  styleMode: StyleMode;
  customStyle: string;
  onModeChange: (mode: StyleMode) => void;
  onCustomStyleChange: (value: string) => void;
}

export default function StyleModeToggle({
  styleMode,
  customStyle,
  onModeChange,
  onCustomStyleChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange("cuemath")}
          style={{
            backgroundColor: styleMode === "cuemath" ? "#FF6B35" : "transparent",
            color: styleMode === "cuemath" ? "#ffffff" : "#6b7280",
            border: styleMode === "cuemath" ? "1px solid #FF6B35" : "1px solid #d1d5db",
          }}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
        >
          Cuemath Brand
        </button>
        <button
          onClick={() => onModeChange("custom")}
          style={{
            backgroundColor: styleMode === "custom" ? "#FF6B35" : "transparent",
            color: styleMode === "custom" ? "#ffffff" : "#6b7280",
            border: styleMode === "custom" ? "1px solid #FF6B35" : "1px solid #d1d5db",
          }}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
        >
          Custom Style
        </button>
      </div>

      {styleMode === "custom" && (
        <input
          type="text"
          value={customStyle}
          onChange={(e) => onCustomStyleChange(e.target.value)}
          placeholder="Describe your style (e.g. dark minimalist, vibrant Gen Z, clean corporate blue)"
          className="w-full px-4 py-2 text-sm rounded-lg"
          style={{ border: "1px solid #d1d5db", color: "#111827", outline: "none" }}
        />
      )}
    </div>
  );
}
"use client";

import { Format } from "@/lib/schema";

interface Props {
  format: Format;
  onFormatChange: (format: Format) => void;
}

const formats: { value: Format; label: string; desc: string }[] = [
  { value: "post", label: "Post", desc: "1:1" },
  { value: "story", label: "Story", desc: "9:16" },
  { value: "carousel", label: "Carousel", desc: "Multi-slide" },
];

export default function FormatPicker({ format, onFormatChange }: Props) {
  return (
    <div className="flex gap-2">
      {formats.map((f) => (
        <button
          key={f.value}
          onClick={() => onFormatChange(f.value)}
          style={{
            backgroundColor: format === f.value ? "#FF6B35" : "transparent",
            color: format === f.value ? "#ffffff" : "#6b7280",
            border: format === f.value ? "1px solid #FF6B35" : "1px solid #d1d5db",
          }}
          className="flex flex-col items-center px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
        >
          <span>{f.label}</span>
          <span style={{ fontSize: "11px", opacity: 0.8 }}>{f.desc}</span>
        </button>
      ))}
    </div>
  );
}
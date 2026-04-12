"use client";

import { useState } from "react";
import { Slide, StyleMode } from "@/lib/schema";

interface SlideVariant {
  heading: string;
  body: string;
  cta: string;
}

interface Props {
  slides: Slide[];
  idea: string;
  styleMode: StyleMode;
  customStyle: string;
  onUpdate: (slides: Slide[]) => void;
}

const inputStyle = {
  border: "1px solid #d1d5db",
  color: "#111827",
  backgroundColor: "#ffffff",
  outline: "none",
  width: "100%",
};

export default function SlideEditor({
  slides,
  idea,
  styleMode,
  customStyle,
  onUpdate,
}: Props) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [variants, setVariants] = useState<{
    index: number;
    options: SlideVariant[];
  } | null>(null);

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const updated = slides.map((s) =>
      s.index === index ? { ...s, [field]: value } : s
    );
    onUpdate(updated);
  };

  const handleTryAngle = async (slide: Slide) => {
    setLoadingIndex(slide.index);
    setVariants(null);
    try {
      const res = await fetch("/api/angle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading: slide.heading,
          idea,
          styleMode,
          customStyle,
        }),
      });
      const data = await res.json();
      setVariants({ index: slide.index, options: data.variants });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIndex(null);
    }
  };

  const pickVariant = (slideIndex: number, variant: SlideVariant) => {
    const updated = slides.map((s) =>
      s.index === slideIndex
        ? { ...s, heading: variant.heading, body: variant.body, cta: variant.cta }
        : s
    );
    onUpdate(updated);
    setVariants(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <p
        style={{ color: "#6b7280", fontSize: "11px", letterSpacing: "0.05em" }}
        className="font-medium uppercase"
      >
        Edit Slides
      </p>

      {slides.map((slide) => (
        <div
          key={slide.index}
          className="flex flex-col gap-3 p-4 rounded-xl"
          style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
        >
          {/* Slide header + Try Angle button */}
          <div className="flex items-center justify-between">
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>
              Slide {slide.index}
            </p>
            <button
              onClick={() => handleTryAngle(slide)}
              disabled={loadingIndex === slide.index}
              style={{
                border: "1px solid #FF6B35",
                color: "#FF6B35",
                backgroundColor: "transparent",
                cursor: loadingIndex === slide.index ? "not-allowed" : "pointer",
                opacity: loadingIndex === slide.index ? 0.6 : 1,
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "6px",
              }}
            >
              {loadingIndex === slide.index ? "Generating..." : "Try Angle"}
            </button>
          </div>

          {/* Variant picker — shows after Try Angle */}
          {variants?.index === slide.index && (
            <div className="flex flex-col gap-2">
              <p style={{ color: "#6b7280", fontSize: "11px" }}>
                Pick a variant — replaces heading, body and CTA:
              </p>
              {variants.options.map((v, i) => (
                <button
                  key={i}
                  onClick={() => pickVariant(slide.index, v)}
                  className="text-left flex flex-col gap-1 p-3 rounded-lg transition-all"
                  style={{
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#FF6B35";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#fff7f5";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#ffffff";
                  }}
                >
                  <span style={{ color: "#111827", fontSize: "13px", fontWeight: 500 }}>
                    {v.heading}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "12px" }}>{v.body}</span>
                  {v.cta && (
                    <span style={{ color: "#FF6B35", fontSize: "11px" }}>{v.cta}</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => setVariants(null)}
                style={{ color: "#9ca3af", fontSize: "11px", cursor: "pointer", background: "none", border: "none" }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="flex flex-col gap-1">
            <label style={{ color: "#9ca3af", fontSize: "11px" }}>Heading</label>
            <input
              type="text"
              value={slide.heading}
              onChange={(e) => updateSlide(slide.index, "heading", e.target.value)}
              style={{ ...inputStyle, padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}
            />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1">
            <label style={{ color: "#9ca3af", fontSize: "11px" }}>Body</label>
            <textarea
              value={slide.body}
              onChange={(e) => updateSlide(slide.index, "body", e.target.value)}
              rows={2}
              style={{ ...inputStyle, padding: "8px 12px", borderRadius: "8px", fontSize: "13px", resize: "none" }}
            />
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-1">
            <label style={{ color: "#9ca3af", fontSize: "11px" }}>CTA (optional)</label>
            <input
              type="text"
              value={slide.cta ?? ""}
              onChange={(e) => updateSlide(slide.index, "cta", e.target.value)}
              style={{ ...inputStyle, padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
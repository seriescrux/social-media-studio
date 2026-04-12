"use client";

import { useState } from "react";
import { Creative, Format, StyleMode } from "@/lib/schema";
import StyleModeToggle from "@/components/StyleModeToggle";
import FormatPicker from "@/components/FormatPicker";
import IdeaInput from "@/components/IdeaInput";
import CreativePreview from "@/components/CreativePreview";
import SlideEditor from "@/components/SlideEditor";

export default function Home() {
  const [styleMode, setStyleMode] = useState<StyleMode>("cuemath");
  const [customStyle, setCustomStyle] = useState("");
  const [format, setFormat] = useState<Format>("carousel");
  const [idea, setIdea] = useState("");
  const [creative, setCreative] = useState<Creative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, format, styleMode, customStyle }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setCreative(data);
    } catch (e) {
      setError("Failed to connect. Check your API key in .env.local");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlidesUpdate = (slides: Creative["slides"]) => {
    if (!creative) return;
    setCreative({ ...creative, slides });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Social Media Studio
            </h1>
            <p className="text-xs text-[#FF6B35] font-medium">for Cuemath</p>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left panel — controls */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">

              {/* Style mode */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Style
                </label>
                <StyleModeToggle
                  styleMode={styleMode}
                  customStyle={customStyle}
                  onModeChange={setStyleMode}
                  onCustomStyleChange={setCustomStyle}
                />
              </div>

              {/* Format */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Format
                </label>
                <FormatPicker format={format} onFormatChange={setFormat} />
              </div>

              {/* Idea input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Your Idea
                </label>
                <IdeaInput
                  idea={idea}
                  isLoading={isLoading}
                  onIdeaChange={setIdea}
                  onGenerate={handleGenerate}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Right panel — preview + editor */}
          <div className="flex flex-col gap-6">

            {/* Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                Preview
              </label>
              <CreativePreview
                creative={creative}
                format={format}
                styleMode={styleMode}
                customStyle={customStyle}
              />
            </div>

            {/* Slide editor — only shows after generation */}
            {creative && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <SlideEditor
                  slides={creative.slides}
                  idea={idea}
                  styleMode={styleMode}
                  customStyle={customStyle}
                  onUpdate={handleSlidesUpdate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
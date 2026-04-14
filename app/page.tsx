"use client";

import { useState, useEffect } from "react";
import { Creative, Format, StyleMode } from "@/lib/schema";
import StyleModeToggle from "@/components/StyleModeToggle";
import FormatPicker from "@/components/FormatPicker";
import IdeaInput from "@/components/IdeaInput";
import CreativePreview from "@/components/CreativePreview";
import SlideEditor from "@/components/SlideEditor";

const ALL_PROMPTS = [
  "Carousel about why kids forget what they learn — explain the forgetting curve — end with how spaced repetition fixes it",
  "Post about why 20 minutes of daily practice beats 3 hours of weekend cramming",
  "Story: 3 signs your child has math anxiety — and what to do about it",
  "Carousel explaining growth mindset for kids — why effort matters more than talent",
  "Post about the science behind why some kids find math harder than others",
  "Carousel: from math fear to math confidence — a parent's guide",
  "Story: did you know most kids give up on math by age 12? Here's why",
  "Post about why homework help from parents sometimes makes things worse",
  "Carousel about active recall — the study technique most kids never learn",
  "Story: your child's teacher can't give them 1-on-1 attention. Here's what fills the gap",
  "Post about why timed math tests create anxiety — and better alternatives",
  "Carousel: 5 things parents say that accidentally kill math confidence",
];

function getRandomPrompts(count = 3): string[] {
  const shuffled = [...ALL_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Home() {
  const [styleMode, setStyleMode] = useState<StyleMode>("cuemath");
  const [customStyle, setCustomStyle] = useState("");
  const [format, setFormat] = useState<Format>("carousel");
  const [idea, setIdea] = useState("");
  const [creative, setCreative] = useState<Creative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const RATE_LIMIT = 10;

  useEffect(() => {
    setPrompts(getRandomPrompts(3));
  }, []);

  const refreshPrompts = () => setPrompts(getRandomPrompts(3));

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    // Client-side rate limiting
    if (requestCount >= RATE_LIMIT) {
      setError("You've reached the request limit for this session. Please refresh the page.");
      return;
    }

    // Input sanitization
    const sanitizedIdea = idea.trim().slice(0, 500);
    if (sanitizedIdea.length < 10) {
      setError("Please enter a more descriptive idea (at least 10 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: sanitizedIdea,
          format,
          styleMode,
          customStyle: customStyle.slice(0, 200),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many requests. Please wait a moment before trying again.");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setCreative(data);
      setRequestCount((c) => c + 1);
    } catch (e) {
      setError("Failed to connect. Please check your connection and try again.");
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
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>

      {/* Grid background overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #f0ede9",
        padding: "0 40px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "34px",
            height: "34px",
            backgroundColor: "#FF6B35",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>C</span>
          </div>
          <div>
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: "#1a1a2e" }}>
              Social Media Studio
            </span>
            <span style={{
              fontSize: "11px",
              color: "#FF6B35",
              fontWeight: 600,
              marginLeft: "8px",
              backgroundColor: "#fff4f0",
              padding: "2px 8px",
              borderRadius: "20px",
              border: "1px solid #ffe0d4",
            }}>
              by Cuemath
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
            <span style={{ fontSize: "12px", color: "#6b7280" }}>AI Ready</span>
          </div>
          {requestCount > 0 && (
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              {RATE_LIMIT - requestCount} requests left
            </span>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: "relative",
        zIndex: 1,
        background: "linear-gradient(135deg, #fff7f4 0%, #ffffff 60%)",
        borderBottom: "1px solid #f0ede9",
        padding: "40px 40px 32px",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#fff4f0",
              border: "1px solid #ffe0d4",
              borderRadius: "20px",
              padding: "4px 12px",
              marginBottom: "12px",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B35", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI-Powered Content Tool
              </span>
            </div>
            <h1 style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: "28px",
              color: "#1a1a2e",
              margin: "0 0 8px",
              lineHeight: 1.3,
            }}>
              Turn any idea into a<br />
              <span style={{ color: "#FF6B35" }}>ready-to-post creative</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Post · Story · Carousel — Cuemath brand or custom style
            </p>
          </div>
          <div style={{ display: "flex", gap: "32px" }}>
            {[
              { label: "Formats", value: "3" },
              { label: "Style modes", value: "2" },
              { label: "Export size", value: "1080px" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px", color: "#FF6B35" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px" }} className="studio-grid">

          {/* Left panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Style + Format */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #f0ede9",
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                    Brand Style
                  </label>
                  <StyleModeToggle
                    styleMode={styleMode}
                    customStyle={customStyle}
                    onModeChange={setStyleMode}
                    onCustomStyleChange={setCustomStyle}
                  />
                </div>
                <div style={{ height: "1px", backgroundColor: "#f5f0ec" }} />
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                    Format
                  </label>
                  <FormatPicker format={format} onFormatChange={setFormat} />
                </div>
              </div>
            </div>

            {/* Idea input */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #f0ede9",
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                Your Idea
              </label>
              <IdeaInput
                idea={idea}
                isLoading={isLoading}
                onIdeaChange={setIdea}
                onGenerate={handleGenerate}
              />
              {error && (
                <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#fef2f2", borderRadius: "10px", fontSize: "13px", color: "#dc2626", border: "1px solid #fecaca" }}>
                  {error}
                </div>
              )}
            </div>

            {/* Prompt suggestions */}
            <div style={{
              backgroundColor: "#fff7f4",
              borderRadius: "20px",
              border: "1px solid #ffe0d4",
              padding: "20px 24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B35", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Prompt Ideas
                </p>
                <button
                  onClick={refreshPrompts}
                  style={{
                    fontSize: "11px",
                    color: "#FF6B35",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  Refresh ↺
                </button>
              </div>
              {prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(prompt)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    marginTop: "8px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #ffe0d4",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "#4b5563",
                    cursor: "pointer",
                    lineHeight: 1.5,
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF6B35")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ffe0d4")}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>

            {/* Preview */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #f0ede9",
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Preview
                </label>
                {creative && (
                  <span style={{
                    fontSize: "11px",
                    color: "#22c55e",
                    fontWeight: 600,
                    backgroundColor: "#f0fdf4",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    border: "1px solid #bbf7d0",
                  }}>
                    {creative.slides.length} slide{creative.slides.length > 1 ? "s" : ""} ready
                  </span>
                )}
              </div>
              <CreativePreview
                creative={creative}
                format={format}
                styleMode={styleMode}
                customStyle={customStyle}
              />
            </div>

            {/* Slide editor */}
            {creative && (
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #f0ede9",
                padding: "24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
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

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid #f0ede9",
        padding: "20px 40px",
        backgroundColor: "#ffffff",
        marginTop: "40px",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            © 2026 Cuemath Social Media Studio
          </span>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            Powered by Groq · Pexels · Next.js
          </span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .studio-grid {
            grid-template-columns: 1fr !important;
          }
        }
        * { box-sizing: border-box; }
        body { overflow-x: hidden; margin: 0; }
      `}</style>
    </div>
  );
}
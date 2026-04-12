import { NextRequest, NextResponse } from "next/server";
import { AngleRequest } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const body: AngleRequest = await req.json();
    const { heading, idea, styleMode, customStyle } = body;

    if (!heading || !idea || !styleMode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    const styleContext =
      styleMode === "cuemath"
        ? "Cuemath parent-facing social media content"
        : customStyle || "modern social media content";

    const prompt = `Rewrite this social media slide 3 different ways for ${styleContext}.

Current slide:
Heading: "${heading}"
Topic: "${idea}"

Return 3 complete slide variants. Each variant should take a completely different angle — different hook style, different emotional approach, different framing.

Return ONLY valid JSON. No markdown. No preamble.
Schema: {
  "variants": [
    { "heading": "...", "body": "...", "cta": "..." },
    { "heading": "...", "body": "...", "cta": "..." },
    { "heading": "...", "body": "...", "cta": "..." }
  ]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 600,
        temperature: 0.8,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: "Groq API error", raw: err },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText: string = data.choices[0].message.content;
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);

    // Strip markdown formatting
    result.variants = result.variants.map((v: { heading: string; body: string; cta: string }) => ({
      heading: v.heading.replace(/\*\*/g, "").replace(/\*/g, "").trim(),
      body: v.body.replace(/\*\*/g, "").replace(/\*/g, "").trim(),
      cta: v.cta ? v.cta.replace(/\*\*/g, "").replace(/\*/g, "").trim() : "",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Angle error:", error);
    return NextResponse.json(
      { error: "Failed to generate angles" },
      { status: 500 }
    );
  }
}
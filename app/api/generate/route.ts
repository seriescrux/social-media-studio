import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompts";
import { GenerateRequest, Creative } from "@/lib/schema";

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { idea, format, styleMode, customStyle } = body;

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Input validation
    if (!idea || idea.length > 500) {
      return NextResponse.json(
        { error: "Idea must be between 1 and 500 characters." },
        { status: 400 }
      );
    }

    if (!format || !styleMode) {
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

    const prompt = buildPrompt(idea, format, styleMode, customStyle);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.7,
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
    const creative: Creative = JSON.parse(cleaned);

    // Strip markdown formatting from Llama output
    creative.slides = creative.slides.map((slide) => ({
      ...slide,
      heading: slide.heading.replace(/\*\*/g, "").replace(/\*/g, "").trim(),
      body: slide.body.replace(/\*\*/g, "").replace(/\*/g, "").trim(),
      cta: slide.cta ? slide.cta.replace(/\*\*/g, "").replace(/\*/g, "").trim() : null,
    }));

    return NextResponse.json(creative);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate creative" },
      { status: 500 }
    );
  }
}
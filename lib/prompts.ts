import { CUEMATH_BRAND } from "./brand";
import { Format, StyleMode } from "./schema";

function getStyleInstruction(styleMode: StyleMode, customStyle?: string): string {
  if (styleMode === "cuemath") {
    return `You write social media content for Cuemath, an online math tutoring platform for school-age children.
Audience: ${CUEMATH_BRAND.audience}.
Tone: ${CUEMATH_BRAND.tone}
Content pillars: ${CUEMATH_BRAND.contentPillars.join(", ")}.
Always write in a warm, encouraging voice that builds parent confidence.`;
  }

  return `Apply this style to all content: ${customStyle || "clean and modern"}.
Adapt your tone, vocabulary, and creative direction to fully match this style.
Be consistent across all slides.`;
}

function getFormatInstruction(format: Format): string {
  if (format === "post") {
    return `Format rules (Instagram Post):
- Exactly 1 slide
- Heading: punchy, under 10 words, grabs attention immediately
- Body: 1-2 short sentences, delivers the value
- CTA: optional, keep it short if included`;
  }

  if (format === "story") {
    return `Format rules (Instagram Story):
- Exactly 1 slide
- Heading: bold 4-5 word hook, must stop the scroll
- Body: maximum 8 words, ultra concise
- CTA: strong and direct, always include one`;
  }

  return `Format rules (Carousel):
- 5 to 7 slides total
- Slide 1: pattern interrupt or surprising stat — make them stop scrolling
- Slides 2-4: build the argument step by step, each slide one clear point
- Final slide: one clear actionable takeaway, always include a CTA
- Each slide should feel like a natural next step from the previous one`;
}

export function buildPrompt(
  idea: string,
  format: Format,
  styleMode: StyleMode,
  customStyle?: string
): string {
  return `${getStyleInstruction(styleMode, customStyle)}

${getFormatInstruction(format)}

User's content idea: "${idea}"

Return ONLY valid JSON. No markdown fences. No preamble. No explanation.
Use exactly this schema:
{
  "format": "${format}",
  "slides": [
    {
      "index": 1,
      "heading": "...",
      "body": "...",
      "cta": "..." or null
    }
  ]
}`;
}

export function buildAnglePrompt(
  heading: string,
  idea: string,
  styleMode: StyleMode,
  customStyle?: string
): string {
  const styleContext =
    styleMode === "cuemath"
      ? "Cuemath parent-facing social media content"
      : customStyle || "modern social media content";

  return `Rewrite this headline 3 ways for ${styleContext}.

Original headline: "${heading}"
Content topic: "${idea}"

Variant 1 — Surprising stat: lead with a counterintuitive number or fact
Variant 2 — Relatable question: open with a concern the audience actually has
Variant 3 — Bold claim: direct, confident, slightly provocative statement

Return ONLY valid JSON. No markdown fences. No preamble.
Schema: { "variants": ["variant1", "variant2", "variant3"] }`;
}
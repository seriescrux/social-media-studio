"use client";

import { useRef, useState, useEffect } from "react";
import { Creative, Format, StyleMode } from "@/lib/schema";

interface Props {
  creative: Creative | null;
  format: Format;
  styleMode: StyleMode;
  customStyle: string;
}

const STOP_WORDS = new Set([
  "the","and","for","are","but","not","you","all","can","was","one","our",
  "out","get","has","how","its","now","say","too","use","your","with","that",
  "this","they","from","have","what","when","will","does","here","just","know",
  "make","most","than","them","then","time","very","well","been","also","into",
  "more","heres","why","kids","child","their","about","some","many","every",
  "need","find","give","keep","help","good","great","real","even","much","only",
  "each","here","just","also","back","come","over","such","take","than","them",
  "well","were","what","when","with","your","dont","isnt","cant","wont","didnt",
]);

function buildQuery(heading: string, styleMode: StyleMode, customStyle: string): string {
  const keywords = heading
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 3)
    .join(" ");

  if (styleMode === "cuemath") {
    return keywords ? `${keywords} children education` : "children education learning";
  }
  return keywords ? `${keywords} ${customStyle || "modern"}` : customStyle || "modern";
}

function SlideCard({
  heading,
  body,
  cta,
  format,
  bgUrl,
}: {
  heading: string;
  body: string;
  cta: string | null;
  format: Format;
  bgUrl: string | null;
}) {
  const isStory = format === "story";

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden flex flex-col justify-end"
      style={{
        width: "300px",
        height: isStory ? "533px" : "300px",
        borderRadius: "12px",
        backgroundColor: "#1A1A2E",
      }}
    >
      {bgUrl ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2d1f3d 100%)" }}
        />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.52)" }} />
      <div className="relative z-10 p-5 flex flex-col gap-2">
        <p
          style={{
            color: "#ffffff",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            fontSize: isStory ? "20px" : "15px",
            lineHeight: "1.4",
          }}
        >
          {heading}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontFamily: "Inter, sans-serif",
            fontSize: isStory ? "15px" : "13px",
            lineHeight: "1.5",
          }}
        >
          {body}
        </p>
        {cta && (
          <span
            style={{
              marginTop: "4px",
              alignSelf: "flex-start",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: "#FF6B35",
            }}
          >
            {cta}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CreativePreview({
  creative,
  format,
  styleMode,
  customStyle,
}: Props) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const singleRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [bgUrls, setBgUrls] = useState<(string | null)[]>([]);

  // Fetch images sequentially when creative changes
  useEffect(() => {
    if (!creative) return;

    setBgUrls([]);

    const fetchSequentially = async () => {
      const usedIds: number[] = [];
      const urls: (string | null)[] = [];

      for (const slide of creative.slides) {
        const query = buildQuery(slide.heading, styleMode, customStyle);
        const usedParam = usedIds.join(",");

        try {
          const res = await fetch(
            `/api/background?query=${encodeURIComponent(query)}&usedIds=${usedParam}`
          );
          const data = await res.json();

          if (data.url) {
            urls.push(data.url);
            if (data.id) usedIds.push(data.id);
          } else {
            urls.push(null);
          }
        } catch {
          urls.push(null);
        }

        // Update UI as each image loads
        setBgUrls([...urls]);
      }
    };

    fetchSequentially();
  }, [creative, styleMode, customStyle]);

  const exportSize = {
    post: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    carousel: { width: 1080, height: 1080 },
  };

  const exportSlide = async (
    el: HTMLDivElement,
    filename: string,
    w: number,
    h: number
  ) => {
    const html2canvas = (await import("html2canvas")).default;
    await new Promise((r) => setTimeout(r, 500));

    const scale = w / el.offsetWidth;
    const canvas = await html2canvas(el, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: scale * 2,
      width: el.offsetWidth,
      height: el.offsetHeight,
      onclone: (_doc, clonedEl) => {
        clonedEl.querySelectorAll("*").forEach((e) => {
          const htmlEl = e as HTMLElement;
          if (htmlEl.style.backgroundColor?.includes("oklab"))
            htmlEl.style.backgroundColor = "#1A1A2E";
          if (htmlEl.style.color?.includes("oklab"))
            htmlEl.style.color = "#ffffff";
        });
      },
    });

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = w;
    finalCanvas.height = h;
    const ctx = finalCanvas.getContext("2d")!;
    ctx.drawImage(canvas, 0, 0, w, h);

    const link = document.createElement("a");
    link.download = filename;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
  };

  const handleExport = async () => {
    if (!creative || exporting) return;
    setExporting(true);
    try {
      const { width, height } = exportSize[format];
      if (format === "carousel") {
        for (let i = 0; i < slideRefs.current.length; i++) {
          const el = slideRefs.current[i];
          if (!el) continue;
          await exportSlide(el, `slide-${i + 1}.png`, width, height);
          await new Promise((r) => setTimeout(r, 500));
        }
      } else {
        if (!singleRef.current) return;
        await exportSlide(singleRef.current, "creative.png", width, height);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed — try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyCaption = () => {
    if (!creative) return;
    const caption = creative.slides.map((s) => s.body).join("\n\n");
    navigator.clipboard.writeText(caption);
    alert("Caption copied!");
  };

  if (!creative) {
    return (
      <div
        className="flex items-center justify-center h-64 rounded-xl"
        style={{ border: "2px dashed #e5e7eb", color: "#9ca3af", fontSize: "14px" }}
      >
        Your creative will appear here
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {format === "carousel" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {creative.slides.map((slide, i) => (
            <div
              key={slide.index}
              ref={(el) => { slideRefs.current[i] = el; }}
            >
              <SlideCard
                {...slide}
                format={format}
                bgUrl={bgUrls[i] ?? null}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <div ref={singleRef}>
            <SlideCard
              {...creative.slides[0]}
              format={format}
              bgUrl={bgUrls[0] ?? null}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            backgroundColor: exporting ? "#f9fafb" : "#ffffff",
            color: "#374151",
            fontSize: "13px",
            cursor: exporting ? "not-allowed" : "pointer",
          }}
        >
          {exporting
            ? "Exporting..."
            : format === "carousel"
            ? `Export ${creative.slides.length} Slides`
            : "Export PNG (1080px)"}
        </button>
        <button
          onClick={handleCopyCaption}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            backgroundColor: "#ffffff",
            color: "#374151",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Copy Caption
        </button>
      </div>

      {format === "carousel" && (
        <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
          Each slide exports individually at 1080×1080px
        </p>
      )}
    </div>
  );
}
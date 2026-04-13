import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "education children learning";
  const usedIds = searchParams.get("usedIds") || "";
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No Pexels key" }, { status: 500 });
  }

  const usedIdList = usedIds ? usedIds.split(",").map(Number) : [];

  for (let page = 1; page <= 5; page++) {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=square&page=${page}`,
      { headers: { Authorization: apiKey } }
    );

    if (!response.ok) continue;

    const data = await response.json();
    const photos = data.photos;
    if (!photos || photos.length === 0) continue;

    const unused = photos.find(
      (p: { id: number }) => !usedIdList.includes(p.id)
    );

    if (unused) {
      return NextResponse.json({ url: unused.src.large2x, id: unused.id });
    }
  }

  return NextResponse.json({ url: null, id: null });
}
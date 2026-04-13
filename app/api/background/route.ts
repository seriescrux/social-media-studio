import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "education children learning";
  const offset = parseInt(searchParams.get("offset") || "0");

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No Pexels key" }, { status: 500 });
  }

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=square`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Pexels error" }, { status: 500 });
  }

  const data = await response.json();
  const photos = data.photos;

  if (!photos || photos.length === 0) {
    return NextResponse.json({ url: null });
  }

  // Use offset to pick different photo per slide
  const index = offset % photos.length;
  const url = photos[index].src.large2x;

  return NextResponse.json({ url });
}
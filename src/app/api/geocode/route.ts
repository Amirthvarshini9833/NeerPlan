import { NextResponse } from "next/server";
import { z } from "zod";

const query = z.string().trim().min(2).max(120);
const result = z.object({ place_id: z.number(), display_name: z.string(), lat: z.string(), lon: z.string(), type: z.string().optional() });
const responseShape = z.array(result);

export async function GET(request: Request) {
  const parsed = query.safeParse(new URL(request.url).searchParams.get("q"));
  if (!parsed.success) return NextResponse.json({ error: "Enter at least two characters to search." }, { status: 400 });
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({ q: parsed.data, format: "jsonv2", limit: "5", countrycodes: "in", addressdetails: "1" }).toString();
    const response = await fetch(url, { headers: { "User-Agent": "NeerPlan/1.0 (https://neer-plan.vercel.app)" }, next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) return NextResponse.json({ error: "Location search is temporarily unavailable." }, { status: 502 });
    const places = responseShape.parse(await response.json()).map((place) => ({ id: place.place_id, name: place.display_name, latitude: Number(place.lat), longitude: Number(place.lon), type: place.type ?? "place" }));
    return NextResponse.json(places);
  } catch {
    return NextResponse.json({ error: "Location search is temporarily unavailable." }, { status: 502 });
  }
}

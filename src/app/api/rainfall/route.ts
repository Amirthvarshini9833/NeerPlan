import { NextResponse } from "next/server";
import { z } from "zod";

const cityInput = z.string().trim().min(2).max(100);
const geocodingResponse = z.object({ results: z.array(z.object({ name: z.string(), latitude: z.number(), longitude: z.number(), admin1: z.string().optional(), country: z.string().optional() })).optional() });
const archiveResponse = z.object({ daily: z.object({ precipitation_sum: z.array(z.number().nullable()) }) });
const sourceUrl = "https://open-meteo.com/en/docs/historical-weather-api";

export async function GET(request: Request) {
  const city = cityInput.safeParse(new URL(request.url).searchParams.get("city"));
  if (!city.success) return NextResponse.json({ error: "Enter a city name of at least two characters." }, { status: 400 });

  const endYear = new Date().getUTCFullYear() - 1;
  const startYear = endYear - 9;
  try {
    const searchUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    searchUrl.search = new URLSearchParams({ name: city.data, count: "1", language: "en", countryCode: "IN" }).toString();
    const search = geocodingResponse.parse(await (await fetch(searchUrl, { next: { revalidate: 60 * 60 * 24 * 90 }, signal: AbortSignal.timeout(8_000) })).json());
    const location = search.results?.[0];
    if (!location) return NextResponse.json({ error: "We could not match that city in India. Keep or enter your rainfall value manually." }, { status: 404 });

    const archiveUrl = new URL("https://archive-api.open-meteo.com/v1/archive");
    archiveUrl.search = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), start_date: `${startYear}-01-01`, end_date: `${endYear}-12-31`, daily: "precipitation_sum", timezone: "UTC" }).toString();
    const archive = archiveResponse.parse(await (await fetch(archiveUrl, { next: { revalidate: 60 * 60 * 24 * 30 }, signal: AbortSignal.timeout(12_000) })).json());
    const values = archive.daily.precipitation_sum.filter((value): value is number => value !== null);
    if (values.length < 3_500) throw new Error("Historical data was incomplete.");

    const annualRainfallMm = Math.round(values.reduce((total, value) => total + value, 0) / 10);
    return NextResponse.json({ annualRainfallMm, location: [location.name, location.admin1 ?? location.country].filter(Boolean).join(", "), source: "Open-Meteo Historical Weather API (ERA5 / ERA5-Land)", sourceUrl, period: `${startYear}–${endYear}`, retrievedAt: new Date().toISOString(), latitude: location.latitude, longitude: location.longitude });
  } catch {
    return NextResponse.json({ error: "The rainfall estimate is temporarily unavailable. Your manual rainfall value is unchanged." }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  targetLanguage: z.enum(["ta", "hi", "te", "kn", "ml"]),
  strings: z.array(z.string().min(1).max(1_000)).min(1).max(50),
}).superRefine(({ strings }, context) => {
  if (strings.reduce((total, value) => total + value.length, 0) > 7_500) {
    context.addIssue({ code: "custom", message: "The translation batch is too large.", path: ["strings"] });
  }
});

const languageNames = {
  ta: "Tamil",
  hi: "Hindi",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
} as const;

const geminiResponseSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({
      parts: z.array(z.object({ text: z.string().optional() })),
    }).optional(),
  })).min(1),
});

const translationSchema = z.object({ translations: z.array(z.string()) });

function getGeminiText(payload: unknown) {
  const candidate = geminiResponseSchema.parse(payload).candidates[0];
  return candidate.content?.parts.map((part) => part.text ?? "").join("") ?? "";
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin translation requests are not allowed." }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid translation request." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Translation is not configured." }, { status: 503 });
  }

  const { targetLanguage, strings } = parsed.data;
  const prompt = [
    `Translate each item in the JSON array from English into ${languageNames[targetLanguage]}.`,
    "Return one translation for every input item in exactly the same order.",
    "Preserve numbers, units, currency symbols, URLs, line breaks, punctuation, and text in braces exactly.",
    "Keep only the literal NeerPlan brand name unchanged; translate every surrounding word in the same item.",
    "Do not translate personal names or email addresses.",
    "Some items may already be in the target language; return them unchanged.",
    `Input: ${JSON.stringify(strings)}`,
  ].join("\n");

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite"}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 4_096,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              additionalProperties: false,
              properties: {
                translations: {
                  type: "array",
                  minItems: strings.length,
                  maxItems: strings.length,
                  items: { type: "string" },
                },
              },
              required: ["translations"],
            },
          },
          store: false,
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    const responseBody: unknown = await geminiResponse.json().catch(() => null);
    if (!geminiResponse.ok) {
      const providerMessage = responseBody && typeof responseBody === "object" && "error" in responseBody
        && responseBody.error && typeof responseBody.error === "object" && "message" in responseBody.error
        && typeof responseBody.error.message === "string" ? responseBody.error.message : undefined;
      console.error("Gemini translation request failed", { status: geminiResponse.status, providerMessage });
      return NextResponse.json({ error: "Translation is temporarily unavailable." }, { status: 502 });
    }

    const translations = translationSchema.parse(JSON.parse(getGeminiText(responseBody))).translations;
    if (translations.length !== strings.length) throw new Error("Gemini returned an incomplete translation set.");

    return NextResponse.json({ translations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Gemini translation response could not be processed", error);
    return NextResponse.json({ error: "Translation is temporarily unavailable." }, { status: 502 });
  }
}

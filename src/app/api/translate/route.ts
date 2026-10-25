import { NextRequest, NextResponse } from "next/server";
import { getJobDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

type Language = "ru" | "uk";
const cache = new Map<string, { title: string; description: string; truncated: boolean; until: number }>();
const pending = new Map<string, Promise<{ title: string; description: string; truncated: boolean }>>();

function plainText(input: string): string {
  return input.replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|li|h[1-6]|div)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"').replace(/&#0?39;/gi, "'")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n/g, "\n\n").trim();
}

function detectSource(value: string): "de" | "en" {
  return /\b(und|oder|wir|suchen|deine|ihre|bewerbung|aufgaben|kenntnisse|erfahrung|mitarbeiter|für)\b/i.test(value) ? "de" : "en";
}

async function translatePiece(text: string, target: Language, source: "de" | "en"): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${source}|${target}`);
  const email = process.env.MYMEMORY_CONTACT_EMAIL;
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) url.searchParams.set("de", email);
  const response = await fetch(url.toString(), { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("translation_failed");
  const data = await response.json() as { responseStatus?: number; responseDetails?: string;
    responseData?: { translatedText?: string } };
  if (data.responseStatus !== 200 || !data.responseData?.translatedText ||
      /quota|limit|exceeded/i.test(data.responseDetails || "")) throw new Error("translation_limit");
  return plainText(data.responseData.translatedText);
}

function chunks(text: string): string[] {
  const pieces: string[] = [];
  let rest = text;
  while (rest.length) {
    if (rest.length <= 440) { pieces.push(rest); break; }
    let split = rest.lastIndexOf(" ", 440);
    if (split < 220) split = 440;
    pieces.push(rest.slice(0, split));
    rest = rest.slice(split).trimStart();
  }
  return pieces;
}

export async function POST(req: NextRequest) {
  let payload: { refnr?: unknown; target?: unknown };
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const refnr = payload.refnr, target = payload.target;
  if (typeof refnr !== "string" || !/^[A-Za-z0-9._\-/]{1,240}$/.test(refnr) ||
      (target !== "ru" && target !== "uk")) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const language = target as Language;
  const key = `${refnr}:${language}`;
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return NextResponse.json({ ...hit, cached: true });

  try {
    let task = pending.get(key);
    if (!task) {
      task = (async () => {
        const job = await getJobDetail(refnr);
        const raw = plainText(job.beschreibung || "");
        // Anonymous MyMemory quota is 5000 chars/day; keep each request bounded.
        const text = raw.slice(0, 3400);
        const source = detectSource(job.titel + " " + raw.slice(0, 500));
        const title = await translatePiece(job.titel.slice(0, 250), language, source);
        const output: string[] = [];
        for (const piece of chunks(text)) output.push(await translatePiece(piece, language, source));
        return { title, description: output.join(" "), truncated: raw.length > text.length };
      })();
      pending.set(key, task);
    }
    const result = await task;
    if (cache.size > 1000) cache.clear();
    cache.set(key, { ...result, until: Date.now() + 7 * 86400000 });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "translation_limit"
      ? "translation_limit" : "translation_failed" }, { status: 429 });
  } finally { pending.delete(key); }
}

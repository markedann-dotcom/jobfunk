import { NextRequest, NextResponse } from "next/server";

/**
 * Бесплатный прокси-эндпоинт для перевода текста.
 *
 * Использует неофициальный публичный Google Translate endpoint
 * (тот же, что использует расширение Google Translate для Chrome).
 * Бесплатный, не требует API-ключа, но без официального SLA от Google —
 * для очень высокой нагрузки в будущем стоит перейти на платный
 * Google Cloud Translation API или DeepL API.
 *
 * Прокси нужен потому что translate.googleapis.com не отдаёт
 * CORS-заголовки — прямой fetch с браузера не сработает.
 */

const MAX_CHARS = 4500; // запас от лимита ~5000 символов на чанк публичного endpoint

export async function POST(req: NextRequest) {
  let body: { text?: string; target?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, target = "uk", source = "auto" } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
  }

  try {
    const translated = await translateLong(text, source, target);
    return NextResponse.json({ translated });
  } catch (err) {
    console.error("Translate proxy error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}

// Переводит длинный текст по частям, разбивая по абзацам, чтобы не
// превышать лимит длины запроса публичного endpoint и не ломать
// структуру текста посреди слова.
async function translateLong(text: string, source: string, target: string): Promise<string> {
  if (text.length <= MAX_CHARS) {
    return translateChunk(text, source, target);
  }

  const paragraphs = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n${para}` : para;
    if (candidate.length > MAX_CHARS && current) {
      chunks.push(current);
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  const translatedChunks = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, source, target))
  );
  return translatedChunks.join("\n");
}

async function translateChunk(text: string, source: string, target: string): Promise<string> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", source);
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    throw new Error(`Google Translate responded with ${res.status}`);
  }

  const data = await res.json();
  // Формат ответа: [[[translatedSentence, originalSentence, ...], ...], ...]
  const sentences = Array.isArray(data?.[0]) ? data[0] : [];
  return sentences.map((s: unknown[]) => s?.[0] ?? "").join("");
}

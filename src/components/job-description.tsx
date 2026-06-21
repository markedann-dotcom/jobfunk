"use client";

import React, { useState } from "react";

/**
 * Renders a plain-text job description (from the Bundesagentur API) as
 * readable, well-structured content: section headings, bullet lists,
 * paragraphs and clickable links (including emails).
 */
export function JobDescription({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);

  const blocks = parse(showTranslation && translatedText ? translatedText : text);

  const handleCopy = async () => {
    try {
      // Очищаем текст от HTML-тегов перед копированием, чтобы в буфере обмена был красивый plain-text
      const sourceText = showTranslation && translatedText ? translatedText : text;
      const cleanText = decodeHtml(sourceText);
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleToggleTranslation = async () => {
    // Уже переведено — просто переключаем обратно на оригинал/перевод
    if (translatedText) {
      setShowTranslation((v) => !v);
      return;
    }

    setTranslating(true);
    setTranslateError(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: decodeHtml(text), target: "uk" }),
      });
      if (!res.ok) throw new Error("Translation request failed");
      const data = await res.json();
      setTranslatedText(data.translated);
      setShowTranslation(true);
    } catch (err) {
      console.error("Failed to translate text", err);
      setTranslateError(true);
      setTimeout(() => setTranslateError(false), 2500);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Кнопки копирования и перевода */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        {translateError && (
          <span className="text-[12px] font-semibold text-red-600">
            Переклад не вдався, спробуйте ще раз
          </span>
        )}
        <button
          onClick={handleToggleTranslation}
          disabled={translating}
          aria-pressed={showTranslation}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all duration-200 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70 ${
            showTranslation
              ? "border-accent bg-accent text-white shadow-sm"
              : "border-border bg-surface text-muted hover:border-accent hover:text-accent hover:shadow-sm"
          }`}
        >
          {translating ? <SpinnerIcon /> : <TranslateIcon />}
          {translating ? "Переклад…" : showTranslation ? "Оригінал" : "Перекласти"}
        </button>
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all duration-200 active:scale-[0.97] ${
            copied
              ? "border-accent/40 bg-accent-soft text-accent-strong"
              : "border-border bg-surface text-muted hover:border-accent hover:text-accent hover:shadow-sm"
          }`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Kopiert!" : "Text kopieren"}
        </button>
      </div>

      {/* Текст вакансии */}
      <div className="space-y-5">
        {blocks.map((b, i) => {
          const blockKey = `${i}-${b.type}`;

          if (b.type === "heading") {
            return (
              <h3
                key={blockKey}
                className="flex items-center gap-2 pt-2 text-[13px] font-extrabold uppercase tracking-wider text-accent-strong first:pt-0"
              >
                <span aria-hidden className="h-3.5 w-1 shrink-0 rounded-full bg-accent" />
                {b.text}
              </h3>
            );
          }
          if (b.type === "list") {
            return (
              <ul key={blockKey} className="space-y-2.5 rounded-xl bg-page/60 p-4">
                {b.items.map((it, j) => (
                  <li key={`${blockKey}-item-${j}`} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span className="text-[15.5px] font-medium leading-relaxed text-ink/90">
                      {inline(it)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p
              key={blockKey}
              className="text-[15.5px] font-medium leading-[1.75] text-ink/90"
            >
              {inline(b.text)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

type Block =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "list"; items: string[] };

// Helper: Cleans up dirty HTML that APIs sometimes leak into plain text
function decodeHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]+>/g, ""); // Strip any remaining HTML tags
}

function parse(raw: string): Block[] {
  const cleaned = decodeHtml(raw);
  const lines = cleaned.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let paraBuf: string[] = [];
  let listBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length) {
      blocks.push({ type: "para", text: paraBuf.join(" ").trim() });
      paraBuf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      blocks.push({ type: "list", items: listBuf.slice() });
      listBuf = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushPara();
      flushList();
      continue;
    }

    // markdown-bold-only line (e.g. "**Unsere Mission**") → heading
    const boldOnly = line.match(/^\*\*(.+?)\*\*:?$/);
    if (boldOnly) {
      flushPara();
      flushList();
      blocks.push({ type: "heading", text: boldOnly[1].trim().replace(/:$/, "") });
      continue;
    }

    // bullet item: "* ", "- ", "• ", "·"  (but NOT markdown "**bold")
    const bullet = line.match(/^([•·]|-|\*(?!\*))\s+(.*)$/);
    if (bullet) {
      flushPara();
      listBuf.push(bullet[2].trim());
      continue;
    }

    // heading: short line, no trailing period, often a single label
    const plain = line.replace(/\*\*/g, "");
    const isHeading =
      plain.length <= 48 &&
      !/[.!?,:;/-]$/.test(plain) && // No ending punctuation
      !/^https?:\/\//i.test(plain) &&
      plain.split(" ").length <= 4 && // Max 4 words
      /^[A-ZÄÖÜ0-9]/.test(plain);

    // Safeguard: Check if it has an empty line above or below
    const isIsolated =
      i === 0 || lines[i - 1].trim() === "" || i === lines.length - 1 || lines[i + 1].trim() === "";

    if (isHeading && isIsolated) {
      flushPara();
      flushList();
      blocks.push({ type: "heading", text: plain.replace(/:$/, "") });
      continue;
    }

    flushList();
    paraBuf.push(line);
  }

  flushPara();
  flushList();
  return blocks;
}

const URL_RE = /(https?:\/\/[^\s]+)/g;
const EMAIL_RE = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;

// Render inline markdown bold (**text**) + links + emails.
function inline(text: string): React.ReactNode {
  const segs = text.split(/(\*\*[^*]+\*\*)/g);
  return segs.map((seg, i) => {
    const b = seg.match(/^\*\*([^*]+)\*\*$/);
    if (b) {
      return (
        <strong key={`bold-${i}`} className="font-bold text-ink">
          {linkify(b[1])}
        </strong>
      );
    }
    return <React.Fragment key={`frag-${i}`}>{linkify(seg)}</React.Fragment>;
  });
}

function linkify(text: string): React.ReactNode {
  // First, isolate URLs
  const urlParts = text.split(URL_RE);

  return urlParts.map((urlPart, i) => {
    if (URL_RE.test(urlPart)) {
      URL_RE.lastIndex = 0; // reset regex state
      return (
        <a
          key={`url-${i}`}
          href={urlPart}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent-strong hover:decoration-accent"
        >
          {urlPart}
        </a>
      );
    }

    // Second, isolate Emails from the remaining plain text
    const emailParts = urlPart.split(EMAIL_RE);
    return emailParts.map((emailPart, j) => {
      if (EMAIL_RE.test(emailPart)) {
        EMAIL_RE.lastIndex = 0;
        return (
          <a
            key={`email-${i}-${j}`}
            href={`mailto:${emailPart}`}
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent-strong hover:decoration-accent"
          >
            {emailPart}
          </a>
        );
      }
      return <React.Fragment key={`text-${i}-${j}`}>{emailPart}</React.Fragment>;
    });
  });
}

// --- Icons ---

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h7M7 3v2M4 19l5-12 5 12M5.5 15h7" />
      <path d="M13 9h7l-3.5 5.5M16.5 14.5 20 19" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

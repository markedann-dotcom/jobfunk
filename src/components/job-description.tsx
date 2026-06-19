"use client";

import React, { useState } from "react";

/**
 * Renders a plain-text job description (from the Bundesagentur API) as
 * readable, well-structured content: section headings, bullet lists,
 * paragraphs and clickable links (including emails).
 */
export function JobDescription({ text }: { text: string }) {
  const blocks = parse(text);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Очищаем текст от HTML-тегов перед копированием, чтобы в буфере обмена был красивый plain-text
      const cleanText = decodeHtml(text);
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="mt-4">
      {/* Кнопка копирования */}
      <div className="mb-5 flex justify-end">
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all active:scale-[0.97] ${
            copied
              ? "border-green-500/40 bg-green-50 text-green-700"
              : "border-border bg-surface text-muted hover:border-accent hover:text-accent hover:shadow-sm"
          }`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Kopiert!" : "Text kopieren"}
        </button>
      </div>

      {/* Текст вакансии */}
      <div className="space-y-4">
        {blocks.map((b, i) => {
          const blockKey = `${i}-${b.type}`;

          if (b.type === "heading") {
            return (
              <h3
                key={blockKey}
                className="pt-1 text-[15px] font-extrabold uppercase tracking-wide text-accent-strong"
              >
                {b.text}
              </h3>
            );
          }
          if (b.type === "list") {
            return (
              <ul key={blockKey} className="space-y-2">
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
          className="break-all font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
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
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

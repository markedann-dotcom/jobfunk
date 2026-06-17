"use client";

import React from "react";

/**
 * Renders a plain-text job description (from the Bundesagentur API) as
 * readable, well-structured content: section headings, bullet lists,
 * paragraphs and clickable links.
 */
export function JobDescription({ text }: { text: string }) {
  const blocks = parse(text);

  return (
    <div className="mt-5 space-y-4">
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          return (
            <h3
              key={i}
              className="pt-1 text-[15px] font-extrabold uppercase tracking-wide text-accent-strong"
            >
              {b.text}
            </h3>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2.5">
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
            key={i}
            className="text-[15.5px] font-medium leading-[1.75] text-ink/90"
          >
            {inline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "list"; items: string[] };

function parse(raw: string): Block[] {
  const lines = raw.replace(/\r/g, "").split("\n");
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

  for (const rawLine of lines) {
    const line = rawLine.trim();

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
      !/[.!?,:;]$/.test(plain) &&
      !/^https?:\/\//i.test(plain) &&
      plain.split(" ").length <= 5 &&
      // not just an inline-looking sentence fragment
      /^[A-ZÄÖÜ0-9]/.test(plain);

    if (isHeading) {
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

// Render inline markdown bold (**text**) + links.
function inline(text: string): React.ReactNode {
  const segs = text.split(/(\*\*[^*]+\*\*)/g);
  return segs.map((seg, i) => {
    const b = seg.match(/^\*\*([^*]+)\*\*$/);
    if (b) {
      return (
        <strong key={i} className="font-bold text-ink">
          {linkify(b[1])}
        </strong>
      );
    }
    return <React.Fragment key={i}>{linkify(seg)}</React.Fragment>;
  });
}

function linkify(text: string): React.ReactNode {
  const parts = text.split(URL_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (URL_RE.test(part)) {
      // reset lastIndex because of global flag reuse
      URL_RE.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

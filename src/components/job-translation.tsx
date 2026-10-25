"use client";

import { useState } from "react";
import { JobDescription } from "@/components/job-description";

type Target = "original" | "ru" | "uk";
type Result = { title: string; description: string; truncated: boolean };

export function JobTranslation({ refnr, title, description }: { refnr: string; title: string; description: string }) {
  const [target, setTarget] = useState<Target>("original");
  const [translations, setTranslations] = useState<Partial<Record<"ru" | "uk", Result>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function switchTo(language: Target) {
    setTarget(language);
    setError("");
    if (language === "original" || translations[language]) return;
    const cacheKey = `jf:translation:v1:${refnr}:${language}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { savedAt: number; result: Result };
        if (Date.now() - parsed.savedAt < 7 * 86400000 && parsed.result?.description) {
          setTranslations(prev => ({ ...prev, [language]: parsed.result }));
          return;
        }
      }
    } catch { /* Private browsing may block storage. */ }

    setBusy(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refnr, target: language }),
      });
      if (!response.ok) throw new Error("limit");
      const result = await response.json() as Result;
      setTranslations(prev => ({ ...prev, [language]: result }));
      try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), result })); } catch { /* optional cache */ }
    } catch {
      setError("Перевод сейчас недоступен: возможно, исчерпан бесплатный дневной лимит. Попробуйте позже.");
    } finally { setBusy(false); }
  }

  const translated = target !== "original" ? translations[target] : undefined;
  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Sprache der Stellenbeschreibung">
        {(["original", "ru", "uk"] as const).map(language => (
          <button key={language} type="button" onClick={() => void switchTo(language)}
            aria-pressed={target === language}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${target === language
              ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:border-accent"}`}>
            {language === "original" ? "Original" : language === "ru" ? "Русский" : "Українська"}
          </button>
        ))}
      </div>
      {busy && <p className="mt-4 text-sm text-muted" role="status">Переводим вакансию…</p>}
      {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
      {translated ? (
        <div lang={target === "ru" ? "ru" : "uk"}>
          <h3 className="mt-5 text-lg font-bold text-ink">{translated.title}</h3>
          <JobDescription text={translated.description} />
          {translated.truncated && <p className="mt-4 text-xs text-muted">Переведена часть текста из-за лимита бесплатного API. Полный оригинал доступен выше по ссылке.</p>}
          <p className="mt-4 text-xs text-muted">Машинный перевод MyMemory. Важные условия проверьте в оригинале.</p>
        </div>
      ) : !busy && <JobDescription text={description} />}
    </div>
  );
}

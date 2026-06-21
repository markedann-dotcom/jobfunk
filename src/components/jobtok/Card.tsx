"use client";
import { useState } from "react";
import Link from "next/link";

export function JobCard({ job, active }: { job: any; active: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-zinc-900 to-black p-5 pt-16">
      {/* Скролл описания внутри карточки */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Заголовок */}
        <div className="mb-4">
          <span className="mb-2 inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400">
            {job.beruf ?? "Job"}
          </span>
          <h2 className="text-2xl font-extrabold leading-tight text-white">
            {job.titel}
          </h2>
          <p className="mt-1 text-base font-semibold text-white/60">
            {job.arbeitgeber}
          </p>
          <p className="text-sm text-white/40">
            📍 {job.arbeitsort?.ort ?? "—"}
          </p>
        </div>
        {/* Описание */}
        {job.stellenbeschreibung && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">
            {job.stellenbeschreibung}
          </p>
        )}
      </div>
      {/* Кнопки снизу */}
      <div className="absolute bottom-6 left-5 right-5 flex gap-3">
        <Link
          href={`/jobs/${job.hashId}`}
          className="flex-1 rounded-xl bg-orange-500 py-3 text-center text-sm font-bold text-white"
        >
          Mehr erfahren
        </Link>
        <button
          onClick={() => setSaved(s => !s)}
          className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
            saved
              ? "bg-orange-500/30 text-orange-400"
              : "bg-white/10 text-white"
          }`}
        >
          {saved ? "♥" : "♡"}
        </button>
        {job.externeUrl && (
          
            href={job.externeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white"
          >
            Bewerben →
          </a>
        )}
      </div>
    </div>
  );
}

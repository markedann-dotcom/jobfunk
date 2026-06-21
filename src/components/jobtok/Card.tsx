"use client";

import { useState } from "react";
import Link from "next/link";
import { jobExternalLink, type JobListItem } from "@/lib/api";

export function JobCard({
  job,
  active,
}: {
  job: JobListItem;
  active: boolean;
}) {
  const [saved, setSaved] = useState(false);

  const location =
    [job.plz, job.ort].filter(Boolean).join(" ") || job.region || "—";

  // jobExternalLink всегда возвращает строку (либо externeUrl, либо ссылку
  // на детальную страницу вакансии на arbeitsagentur.de)
  const applyUrl = jobExternalLink(job);

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-zinc-900 to-black p-5 pt-16">
      {/* Скролл контента внутри карточки */}
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
          <p className="text-sm text-white/40">📍 {location}</p>
        </div>

        {/*
          В JobListItem нет полного описания вакансии (оно есть только
          в JobDetail / getJobDetail(refnr)). Если нужно показывать
          описание прямо в карточке ленты — подгружай его лениво по refnr,
          либо покажи здесь то немногое, что есть в списке (entfernung и т.п.)
        */}
        {job.entfernung && (
          <p className="mt-2 text-xs text-white/40">{job.entfernung}</p>
        )}
      </div>

      {/* Кнопки снизу */}
      <div className="absolute bottom-6 left-5 right-5 flex gap-3">
        <Link
          href={`/job/${job.refnr}`}
          className="flex-1 rounded-xl bg-orange-500 py-3 text-center text-sm font-bold text-white"
        >
          Mehr erfahren
        </Link>

        <button
          onClick={() => setSaved((s) => !s)}
          className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
            saved
              ? "bg-orange-500/30 text-orange-400"
              : "bg-white/10 text-white"
          }`}
        >
          {saved ? "♥" : "♡"}
        </button>

        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white"
        >
          Bewerben →
        </a>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { JobListItem } from "@/lib/api";
import { jobExternalLink } from "@/lib/api";

interface SimilarJobsProps {
  refnr: string;
}

export default function SimilarJobs({ refnr }: SimilarJobsProps) {
  const [jobs, setJobs] = useState<JobListItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/job/${encodeURIComponent(refnr)}/similar`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: JobListItem[]) => {
        if (!cancelled) setJobs(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [refnr]);

  if (error || (jobs && jobs.length === 0)) return null;

  return (
    <section>
      <h2>Похожие вакансии</h2>
      {!jobs ? (
        <p>Загрузка…</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.refnr}>
              <a href={jobExternalLink(job)} target="_blank" rel="noopener noreferrer">
                {job.titel}
              </a>
              {job.arbeitgeber && <span> — {job.arbeitgeber}</span>}
              {job.ort && <span>, {job.ort}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

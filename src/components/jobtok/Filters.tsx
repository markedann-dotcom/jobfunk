"use client";

export function JobTokFilters({ wo, was, onWo, onWas }: {
  wo: string; was: string;
  onWo: (v: string) => void;
  onWas: (v: string) => void;
}) {
  return (
    <div className="flex flex-1 gap-2">
      <input
        value={was}
        onChange={e => onWas(e.target.value)}
        placeholder="Beruf…"
        className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
      />
      <input
        value={wo}
        onChange={e => onWo(e.target.value)}
        placeholder="Stadt…"
        className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
      />
    </div>
  );
}

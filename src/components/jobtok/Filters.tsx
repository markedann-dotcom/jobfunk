"use client";

export function JobTokFilters({ wo, was, onWo, onWas }: {
  wo: string; was: string;
  onWo: (v: string) => void;
  onWas: (v: string) => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex gap-2 px-4 pt-3 pb-2 bg-gradient-to-b from-black/80 to-transparent">
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

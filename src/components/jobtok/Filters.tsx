"use client";

export function JobTokFilters({ wo, was, onWo, onWas }: {
  wo: string; was: string;
  onWo: (v: string) => void;
  onWas: (v: string) => void;
}) {
  const style = {
    background: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
    color: "var(--color-ink)",
  } as const;
  return (
    <div className="flex flex-1 gap-2">
      <input
        value={was}
        onChange={e => onWas(e.target.value)}
        placeholder="Beruf…"
        className="jobtok-input flex-1 rounded-lg px-3 py-2 text-sm outline-none backdrop-blur-sm"
        style={style}
      />
      <input
        value={wo}
        onChange={e => onWo(e.target.value)}
        placeholder="Stadt…"
        className="jobtok-input flex-1 rounded-lg px-3 py-2 text-sm outline-none backdrop-blur-sm"
        style={style}
      />
    </div>
  );
}

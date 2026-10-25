import { NextRequest, NextResponse } from "next/server";
import { searchJobs, type Angebotsart } from "@/lib/api";

export const dynamic = "force-dynamic";

// ---- Input validation / hardening ------------------------------------------

const ANGEBOTSART = new Set(["", "1", "2", "4", "34"]);
const SORT = new Set(["", "aktualitaet", "entfernung"]);
const BEFRISTUNG = new Set(["", "1", "2"]);

/** Trim, cap length, strip control chars. Empty → undefined. */
function clean(v: string | null, max = 120): string | undefined {
  if (typeof v !== "string") return undefined;
  // eslint-disable-next-line no-control-regex
  const s = v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
  return s.length ? s : undefined;
}

function intIn(v: string | null, def: number, min: number, max: number): number {
  const n = Number.parseInt(v ?? "", 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(n, min), max);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const angebotsartRaw = sp.get("angebotsart") ?? "";
  const angebotsart = (ANGEBOTSART.has(angebotsartRaw) ? angebotsartRaw : "") as Angebotsart;

  const sortRaw = sp.get("sort") ?? "";
  const sort = SORT.has(sortRaw) ? sortRaw : "";

  const befRaw = sp.get("befristung") ?? "";
  const befristung = BEFRISTUNG.has(befRaw) ? befRaw : undefined;

  // arbeitszeit is a ";"-joined set of known codes — keep only valid ones
  const azCodes = new Set(["vz", "tz", "ho", "mj", "snw"]);
  const arbeitszeit =
    clean(sp.get("arbeitszeit"), 40)
      ?.split(";")
      .filter((c) => azCodes.has(c))
      .join(";") || undefined;

  try {
    const result = await searchJobs({
      was: clean(sp.get("was"), 120),
      wo: clean(sp.get("wo"), 80),
      umkreis: clean(sp.get("umkreis"), 4),
      angebotsart,
      arbeitszeit,
      veroeffentlichtseit: clean(sp.get("veroeffentlichtseit"), 4),
      befristung,
      sort: sort || undefined,
      page: intIn(sp.get("page"), 1, 1, 200),
      size: intIn(sp.get("size"), 25, 1, 100),
    });
    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=120" },
    });
  } catch {
    // Do not leak upstream/internal error details to the client.
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 });
  }
}

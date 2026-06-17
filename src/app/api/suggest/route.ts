import { NextRequest, NextResponse } from "next/server";
import { suggestBerufe } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Trim, cap length, strip control chars. */
function clean(v: string | null, max = 80): string {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

export async function GET(req: NextRequest) {
  const was = clean(req.nextUrl.searchParams.get("was"));
  if (was.length < 2) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
  try {
    const items = await suggestBerufe(was, 8);
    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
      }
    );
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

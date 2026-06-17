import { NextRequest, NextResponse } from "next/server";
import { getJobDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ refnr: string }> }
) {
  const { refnr: raw } = await params;

  let refnr = "";
  try {
    refnr = decodeURIComponent(raw);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Validate: Bundesagentur refnr — alphanumeric + a few separators, bounded length.
  // eslint-disable-next-line no-control-regex
  refnr = refnr.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!refnr || refnr.length > 120 || !/^[A-Za-z0-9._\-/]+$/.test(refnr)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const detail = await getJobDetail(refnr);
    return NextResponse.json(detail, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    // Do not leak upstream/internal error details to the client.
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 });
  }
}

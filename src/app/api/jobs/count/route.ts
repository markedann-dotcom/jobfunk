import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/api";
import { rateLimit, clientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rl = rateLimit(`count:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { total: 0 },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    // Request a single job; the upstream still returns the overall total.
    const result = await searchJobs({ size: 1 });
    return NextResponse.json(
      { total: result.total },
      { status: 200, headers: { "Cache-Control": "public, max-age=600" } }
    );
  } catch {
    // Do not leak upstream/internal error details to the client.
    return NextResponse.json({ total: 0 }, { status: 502 });
  }
}

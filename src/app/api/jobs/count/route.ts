import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/api";
import { rateLimit, clientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Защита от DDoS и спама (rate limiting)
  const rl = rateLimit(`count:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { total: 0 },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    // Вызываем нашу обновленную функцию, которая УЖЕ ищет по ДВУМ базам (BA + Arbeitnow)
    const result = await searchJobs({ size: 1 });
    
    return NextResponse.json(
      { total: result.total },
      { 
        status: 200, 
        headers: { 
          // Кэшируем результат на 10 минут, чтобы шапка загружалась мгновенно
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
          ...rateLimitHeaders(rl)
        } 
      }
    );
  } catch (error) {
    // В случае сбоя внешних API отдаем 0, чтобы не "ронять" шапку сайта
    return NextResponse.json({ total: 0 }, { status: 502 });
  }
}

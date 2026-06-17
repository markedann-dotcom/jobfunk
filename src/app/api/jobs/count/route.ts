import { NextResponse } from "next/server";
// ВНИМАНИЕ: Замените "@/lib/api" на реальный путь к файлу, 
// который вы мне скидывали в предыдущем сообщении!
import { searchJobs } from "@/lib/api"; 

export async function GET() {
  try {
    // Запрашиваем всего 1 вакансию (чтобы не грузить сервер), 
    // но API все равно вернет нам общее число вакансий (total)
    const result = await searchJobs({ size: 1 });
    
    return NextResponse.json({ total: result.total });
  } catch (error) {
    console.error("Ошибка при получении счетчика вакансий:", error);
    return NextResponse.json({ total: 0 }, { status: 500 });
  }
}

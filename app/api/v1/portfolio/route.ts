import { NextResponse } from "next/server";
import { engagements, SYNTHETIC_NOTICE } from "@/src/domain/fixtures";
import { buildPortfolioRows } from "@/src/services/portfolio-service";

export const dynamic = "force-static";
export async function GET() {
  return NextResponse.json({ synthetic: true, notice: SYNTHETIC_NOTICE, generatedFrom: ["project-v14", "resource-v8", "finance-v6"], rows: buildPortfolioRows(engagements) });
}

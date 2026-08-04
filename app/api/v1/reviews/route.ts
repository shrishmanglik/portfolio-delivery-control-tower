import { NextResponse } from "next/server";
import { recordDecision } from "@/src/services/portfolio-service";

export async function POST(request: Request) {
  const result = recordDecision(await request.json(), new Date().toISOString());
  if (!result.ok) return NextResponse.json({ error: "VALIDATION_FAILED", fields: result.errors }, { status: 422 });
  return NextResponse.json({ receipt: result.receipt }, { status: 201 });
}

import { NextResponse } from "next/server";
import { searchStations } from "@/lib/landhousing";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1), 200);
  return NextResponse.json({ q, limit, ...searchStations(q, limit) });
}

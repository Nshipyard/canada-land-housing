import { NextResponse } from "next/server";
import { getData, getDecomposition } from "@/lib/landhousing";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const geo = searchParams.get("geo") ?? "Toronto, Ontario";
  const series = getDecomposition(geo);
  if (!series) {
    const { decomp } = getData();
    return NextResponse.json(
      { error: `Unknown geography. Available: ${Object.keys(decomp.series).join(", ")}` },
      { status: 404 }
    );
  }
  const { stats } = getData().decomp;
  return NextResponse.json({ geo, ...series, stats: geo === "Toronto, Ontario" ? stats : undefined });
}

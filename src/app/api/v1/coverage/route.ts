import { NextResponse } from "next/server";
import { getData } from "@/lib/landhousing";

export async function GET() {
  const { coverage } = getData();
  return NextResponse.json(coverage);
}

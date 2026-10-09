import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Canada Land vs Housing API",
    version: "1.0.0",
    description:
      "Testing the transit land-value thesis with open data: Statistics Canada's house-only vs land-only New Housing Price Index split (27 CMAs, 1981-2026) and housing units within 800m of 67 TTC subway stations from Toronto's development pipeline. The station-level land split is documented as unavailable in open data (MPAC login-only, Teranet proprietary). MIT licensed.",
  },
  servers: [{ url: "https://landvalue.canada.nshipyard.com/api/v1" }],
  paths: {
    "/decomposition": {
      get: {
        summary: "House-only vs land-only price series for a metro area",
        parameters: [
          { name: "geo", in: "query", required: false, schema: { type: "string" }, example: "Toronto, Ontario" },
        ],
        responses: { "200": { description: "Monthly index series plus growth stats" }, "404": { description: "Unknown geography" } },
      },
    },
    "/stations": {
      get: {
        summary: "Search 67 TTC stations with built and pipeline housing units within 800m",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "wellesley" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: { "200": { description: "Total plus matching station records" } },
      },
    },
    "/coverage": {
      get: {
        summary: "What the open data can and cannot test, with the exact gaps",
        responses: { "200": { description: "Coverage matrix" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}

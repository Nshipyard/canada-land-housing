import { NextResponse } from "next/server";
import { getData, getDecomposition, searchStations } from "@/lib/landhousing";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "canada-land-housing", version: "1.0.0" };

const TOOLS = [
  {
    name: "decomposition_lookup",
    description:
      "Statistics Canada house-only vs land-only New Housing Price Index series for a Canadian metro area (1981-2026). Toronto: structure +352%, land +190%; land series flagged use-with-caution.",
    inputSchema: {
      type: "object",
      properties: {
        geo: { type: "string", description: "Metro area, e.g. 'Toronto, Ontario'. 27 CMAs available." },
      },
      required: ["geo"],
    },
  },
  {
    name: "station_supply",
    description:
      "Housing units within 800m of TTC subway stations (67 stations, Lines 1/2/4) from Toronto's development pipeline: built plus pipeline units per station.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Station name fragment" },
        limit: { type: "integer", description: "Max results, default 50, max 200" },
      },
    },
  },
  {
    name: "coverage",
    description:
      "What the open data can and cannot test about the land-vs-housing thesis: the station-level land split is blocked (MPAC login-only, Teranet proprietary).",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "decomposition_lookup") {
          const series = getDecomposition(String(args.geo ?? ""));
          if (!series) return err(id, -32001, `Unknown geography ${args.geo}`);
          const { stats } = getData().decomp;
          return ok(id, textResult({ geo: args.geo, ...series, stats }));
        }
        if (name === "station_supply") {
          const q = String(args.q ?? "");
          const limit = Math.min(Math.max(parseInt(String(args.limit ?? "50"), 10) || 50, 1), 200);
          return ok(id, textResult({ q, limit, ...searchStations(q, limit) }));
        }
        if (name === "coverage") {
          return ok(id, textResult(getData().coverage));
        }
        return err(id, -32601, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, String(e));
      }
    }
    default:
      return err(id, -32601, `Unknown method ${msg.method}`);
  }
}

export async function POST(req: Request) {
  const msg = await req.json();
  const res = handle(msg);
  if (res === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(res);
}

export async function GET() {
  return NextResponse.json({ name: SERVER.name, version: SERVER.version, transport: "streamable-http", tools: TOOLS.map((t) => t.name) });
}

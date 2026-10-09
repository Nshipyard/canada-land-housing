import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface NhpiPoint { d: string; v: number }
export interface NhpiGeo {
  "House only": NhpiPoint[];
  "Land only": NhpiPoint[];
  "Total (house and land)": NhpiPoint[];
}
export interface NhpiStats {
  geo: string; range: [string, string];
  house_first: number; house_last: number; land_first: number; land_last: number;
  house_growth_pct: number; land_growth_pct: number;
  land_vs_house_ratio_first: number; land_vs_house_ratio_last: number;
  caveat: string;
}
export interface StationSupply {
  name: string; line: number; opened: number; lat: number; lon: number;
  projects_800m: number; built_units_800m: number; pipeline_units_800m: number; total_units_800m: number;
}
export interface CoverageTest { test: string; possible: boolean; basis: string | null; limit: string }

interface Cache {
  decomp: { series: Record<string, NhpiGeo>; stats: NhpiStats; source: string };
  supply: { stations: StationSupply[]; summary: Record<string, unknown>; source: string };
  coverage: { tests: CoverageTest[] };
}

let cache: Cache | null = null;

export function getData(): Cache {
  if (cache) return cache;
  const decomp = JSON.parse(fs.readFileSync(path.join(DATA, "nhpi_decomposition.json"), "utf8"));
  const supply = JSON.parse(fs.readFileSync(path.join(DATA, "station_supply.json"), "utf8"));
  const coverage = JSON.parse(fs.readFileSync(path.join(DATA, "coverage.json"), "utf8"));
  cache = { decomp, supply, coverage };
  return cache;
}

export function searchStations(q: string, limit: number): { total: number; hits: StationSupply[] } {
  const { stations } = getData().supply;
  const needle = q.trim().toLowerCase();
  const hits = needle
    ? stations.filter((s) => s.name.toLowerCase().includes(needle))
    : [...stations].sort((a, b) => b.total_units_800m - a.total_units_800m);
  return { total: hits.length, hits: hits.slice(0, limit) };
}

export function getDecomposition(geo: string): NhpiGeo | null {
  const { series } = getData().decomp;
  const key = Object.keys(series).find((k) => k.toLowerCase() === geo.trim().toLowerCase());
  return key ? series[key] : null;
}

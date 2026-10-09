"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/decomposition?geo=Toronto%2C%20Ontario",
    desc: "House-only vs land-only NHPI series for a metro area, 1981-2026",
    response: `{
  "geo": "Toronto, Ontario",
  "House only": [ { "d": "1981-01", "v": 22.6 }, … ],
  "Land only": [ { "d": "1981-01", "v": 39.1 }, … ],
  "stats": { "house_growth_pct": 352.2, "land_growth_pct": 190.0 }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/stations?q=wellesley&limit=3",
    desc: "Search 67 TTC stations; each record carries built and pipeline units within 800m",
    response: `{
  "q": "wellesley", "total": 1,
  "hits": [ {
    "name": "Wellesley", "line": 1, "opened": 1954,
    "built_units_800m": 8407, "pipeline_units_800m": 35168
  } ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/coverage",
    desc: "What the open data can and cannot test, with the exact gaps",
    response: `{ "tests": [
  { "test": "Land vs structure split, metro level",
    "possible": true, … },
  { "test": "Land vs structure split around stations",
    "possible": false,
    "limit": "MPAC parcel assessments sit behind a login…" }
] }`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="flex min-w-0 flex-col rounded-[24px] border border-white/15 bg-white/5 p-6">
              <p className="font-mono text-[12px] font-semibold text-white/60">{e.method}</p>
              <code className="mt-1 break-all font-mono text-[13px] text-white">{e.path}</code>
              <p className="mt-2 text-[14px] text-white/65">{e.desc}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-[16px] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/80">
                {e.response}
              </pre>
              <a
                href={e.path}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block self-start rounded-full border border-white/25 px-5 py-2 text-[14px] font-semibold hover:border-white"
              >
                {t.developers.tryIt} →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="block rounded-[24px] bg-white/[0.06] p-6 hover:bg-white/[0.09]">
            <h4 className="text-[19px] font-semibold">{t.developers.openapi}</h4>
            <code className="mt-2 block font-mono text-[13px] text-white/60">GET /api/openapi.json</code>
          </a>
        </div>

        <McpConnect
          config={{
            slug: "canada-land-housing",
            displayName: "Canada Land vs Housing",
            exampleEn: "Show me the house-only vs land-only price split for Toronto and the top stations by housing supply",
            exampleFr: "Montre-moi la répartition prix-maison contre prix-terrain pour Toronto et les stations avec le plus de logements",
          }}
        />
      </div>
    </section>
  );
}

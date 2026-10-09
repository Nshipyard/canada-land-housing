"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";

const RED = "#d80621";
const INK = "#0a0f1e";

interface Pt { d: string; v: number }

function LineChart({ house, land, labels }: { house: Pt[]; land: Pt[]; labels: { house: string; land: string } }) {
  const W = 880, H = 340, P = { l: 56, r: 16, t: 16, b: 36 };
  const all = [...house, ...land];
  const min = Math.min(...all.map((p) => p.v)) * 0.95;
  const max = Math.max(...all.map((p) => p.v)) * 1.02;
  const n = house.length;
  const x = (i: number) => P.l + (i / (n - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const path = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const years = house.filter((_, i) => i % 60 === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={P.l} x2={W - P.r} y1={P.t + f * (H - P.t - P.b)} y2={P.t + f * (H - P.t - P.b)} stroke={INK} strokeOpacity={0.08} />
      ))}
      {years.map((p) => {
        const i = house.indexOf(p);
        return (
          <text key={p.d} x={x(i)} y={H - 12} textAnchor="middle" fontSize={12} fill={INK} opacity={0.55}>
            {p.d.slice(0, 4)}
          </text>
        );
      })}
      <path d={path(land)} fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="6 4" />
      <path d={path(house)} fill="none" stroke={RED} strokeWidth={2.5} />
      <circle cx={x(n - 1)} cy={y(house[n - 1].v)} r={4} fill={RED} />
      <circle cx={x(n - 1)} cy={y(land[n - 1].v)} r={4} fill={INK} opacity={0.45} />
      <text x={W - P.r} y={y(house[n - 1].v) - 10} textAnchor="end" fontSize={13} fontWeight={600} fill={RED}>{labels.house}</text>
      <text x={W - P.r} y={y(land[n - 1].v) + 18} textAnchor="end" fontSize={13} fill={INK} opacity={0.7}>{labels.land}</text>
    </svg>
  );
}

function Bars({ stations, lang }: { stations: { name: string; built_units_800m: number; pipeline_units_800m: number }[]; lang: string }) {
  const top = [...stations].sort((a, b) => b.built_units_800m + b.pipeline_units_800m - (a.built_units_800m + a.pipeline_units_800m)).slice(0, 12);
  const max = Math.max(...top.map((s) => s.built_units_800m + s.pipeline_units_800m));
  const fmt = (n: number) => n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
  return (
    <div className="space-y-3">
      {top.map((s) => {
        const tot = s.built_units_800m + s.pipeline_units_800m;
        return (
          <div key={s.name}>
            <div className="flex items-baseline justify-between gap-3 text-[14px]">
              <span className="font-medium">{s.name}</span>
              <span className="shrink-0 tabular-nums text-ink/60">{fmt(tot)}</span>
            </div>
            <div className="mt-1 flex h-[10px] overflow-hidden rounded-full bg-ink/8">
              <div className="h-full bg-canada" style={{ width: `${(s.built_units_800m / max) * 100}%` }} />
              <div className="h-full bg-ink/25" style={{ width: `${(s.pipeline_units_800m / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Showcase() {
  const { t, lang } = useLang();
  const [decomp, setDecomp] = useState<{ series: Record<string, { "House only": Pt[]; "Land only": Pt[] }>; stats: any } | null>(null);
  const [supply, setSupply] = useState<{ stations: { name: string; built_units_800m: number; pipeline_units_800m: number }[] } | null>(null);
  const [coverage, setCoverage] = useState<{ tests: { test: string; possible: boolean; basis: string | null; limit: string }[] } | null>(null);

  useEffect(() => {
    fetch("/data/nhpi_decomposition.json").then((r) => r.json()).then(setDecomp);
    fetch("/data/station_supply.json").then((r) => r.json()).then(setSupply);
    fetch("/data/coverage.json").then((r) => r.json()).then(setCoverage);
  }, []);

  const toronto = decomp?.series["Toronto, Ontario"];
  // downsample monthly to every 4th point for the SVG
  const ds = useMemo(() => {
    if (!toronto) return null;
    const f = (pts: Pt[]) => pts.filter((_, i) => i % 4 === 0);
    return { house: f(toronto["House only"]), land: f(toronto["Land only"]) };
  }, [toronto]);

  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.showcase.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.showcase.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.showcase.body}</p>

        <div className="mt-12 rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
          <h3 className="display text-[28px]">{t.showcase.decompTitle}</h3>
          <p className="mt-2 text-[14px] text-ink/60">{t.showcase.decompSub}</p>
          <div className="mt-6">
            {ds ? (
              <LineChart house={ds.house} land={ds.land} labels={{ house: t.showcase.houseOnly, land: t.showcase.landOnly }} />
            ) : (
              <p className="text-ink/50">…</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
            <h3 className="display text-[28px]">{t.showcase.topTitle}</h3>
            <p className="mt-2 text-[14px] text-ink/60">{t.showcase.topSub}</p>
            <div className="mt-4 flex gap-5 text-[13px] text-ink/60">
              <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-canada" />{t.showcase.builtUnits}</span>
              <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-ink/25" />{t.showcase.pipelineUnits}</span>
            </div>
            <div className="mt-6">{supply ? <Bars stations={supply.stations} lang={lang} /> : <p className="text-ink/50">…</p>}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-ink p-6 text-white md:p-8">
            <h3 className="display text-[28px]">{t.showcase.coverageTitle}</h3>
            <p className="mt-2 text-[14px] text-white/65">{t.showcase.coverageSub}</p>
            <div className="mt-6 space-y-5">
              {(coverage?.tests ?? []).map((c) => (
                <div key={c.test} className="border-b border-white/10 pb-5 last:border-0">
                  <p className="text-[15px] font-semibold leading-snug">{c.test}</p>
                  <p className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${c.possible ? "bg-emerald-400/20 text-emerald-300" : "bg-canada/25 text-red-300"}`}>
                    {c.possible ? t.showcase.possible : t.showcase.blocked}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/60">{c.limit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

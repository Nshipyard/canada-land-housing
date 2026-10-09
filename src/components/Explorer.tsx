"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";

interface Station {
  name: string; line: number; opened: number; lat: number; lon: number;
  projects_800m: number; built_units_800m: number; pipeline_units_800m: number; total_units_800m: number;
}

function fmt(n: number, lang: string) {
  return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
}

export default function Explorer() {
  const { t, lang } = useLang();
  const [stations, setStations] = useState<Station[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Station | null>(null);

  useEffect(() => {
    fetch("/data/station_supply.json").then((r) => r.json()).then((d) => setStations(d.stations));
  }, []);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle ? stations.filter((s) => s.name.toLowerCase().includes(needle)) : stations;
    return list.slice(0, 24);
  }, [stations, q]);

  const total = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? stations.filter((s) => s.name.toLowerCase().includes(needle)).length : stations.length;
  }, [stations, q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setSel(null); }}
        placeholder={t.explorer.search}
        className="w-full max-w-[560px] rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none placeholder:text-ink/40 focus:border-ink"
      />
      <p className="mt-4 text-[14px] text-ink/55">
        {t.explorer.showing} {hits.length} {t.explorer.of} {total}
      </p>
      {sel ? (
        <div className="mt-6 rounded-[24px] border border-line bg-paper p-7">
          <button onClick={() => setSel(null)} className="text-[14px] font-medium text-canada hover:underline">
            ← {t.explorer.back}
          </button>
          <h3 className="display mt-3 text-[34px]">{sel.name}</h3>
          <p className="mt-1 text-[15px] text-ink/60">
            {t.explorer.line} {sel.line} · {t.explorer.opened} {sel.opened} · {sel.projects_800m} {t.explorer.projects}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] bg-paper-warm p-5">
              <p className="display text-[36px] text-canada">{fmt(sel.built_units_800m, lang)}</p>
              <p className="mt-1 text-[14px] text-ink/60">{t.explorer.built} (800m)</p>
            </div>
            <div className="rounded-[16px] bg-paper-warm p-5">
              <p className="display text-[36px]">{fmt(sel.pipeline_units_800m, lang)}</p>
              <p className="mt-1 text-[14px] text-ink/60">{t.explorer.pipeline} (800m)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {hits.map((s) => (
            <button
              key={s.name}
              onClick={() => setSel(s)}
              className="bg-paper p-5 text-left transition-colors hover:bg-paper-warm"
            >
              <p className="text-[17px] font-semibold">{s.name}</p>
              <p className="mt-0.5 text-[13px] text-ink/55">
                {t.explorer.line} {s.line} · {s.opened}
              </p>
              <p className="mt-2 text-[14px]">
                <span className="font-semibold text-canada">{fmt(s.built_units_800m, lang)}</span>{" "}
                <span className="text-ink/55">{t.explorer.built}</span>
                {" · "}
                <span className="font-semibold">{fmt(s.pipeline_units_800m, lang)}</span>{" "}
                <span className="text-ink/55">{t.explorer.pipeline}</span>
              </p>
            </button>
          ))}
        </div>
      )}
      {!stations.length && <p className="mt-6 text-[15px] text-ink/55">…</p>}
    </div>
  );
}

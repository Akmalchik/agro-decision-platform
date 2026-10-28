"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { getPlanningMessages } from "@/i18n/planning";
import { intlLocales, localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { cropCodes, markets, type Plan, type PlotScope, type Submission, type forecastDistrict } from "@/modules/planning/domain";
import type { proposeTransfers } from "@/modules/planning/logistics";

type Dataset = { plots: PlotScope[]; submissions: Submission[]; forecast: ReturnType<typeof forecastDistrict>; options: ReturnType<typeof proposeTransfers>; storageReady: boolean; mode: Plan["mode"]; calculatedAt: string };
type Allocation = Plan["allocations"][number];
export function PlanningWorkspace({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const m = getPlanningMessages(locale);
  const [season, setSeason] = useState("2027");
  const [seasonDraft, setSeasonDraft] = useState("2027");
  const [mode, setMode] = useState<Plan["mode"]>("DEMO");
  const [data, setData] = useState<Dataset | null>(null);
  const [plotId, setPlotId] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([{ crop: "MOSH", area: 1, market: "UNKNOWN" }]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef("");
  const selected = useRef("");
  const sequence = useRef(0);
  const format = (value: number | null) => value === null ? m.unavailable : new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 2 }).format(value);
  const errorText = (code: string) => code === "UNAUTHORIZED" || code === "WRITES_NOT_CONFIGURED" ? m.credentials : code === "PLAN_CHANGED_RELOAD" ? m.conflict : code === "AREA_EXCEEDS_PLOT" ? m.areaError : m.error;
  const load = useCallback(async () => {
    const token = ++sequence.current;
    const response = await fetch(`/api/planning?season=${season}&mode=${mode}`, { headers: { Authorization: `Bearer ${key.current}` }, cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.code ?? "FAILED");
    if (token !== sequence.current) return;
    const next: Dataset = payload.data;
    setData(next);
    const id = next.plots.some((plot) => plot.id === selected.current) ? selected.current : next.plots[0]?.id ?? "";
    selected.current = id; setPlotId(id);
    const plan = next.submissions.find((item) => item.plotId === id);
    setAllocations(plan?.allocations ?? [{ crop: "MOSH", area: 1, market: "UNKNOWN" }]);
  }, [season, mode]);
  useEffect(() => { let active = true; load().catch(() => { if (active) { setData(null); setStatus(m.error); } }); return () => { active = false; sequence.current += 1; }; }, [load, m.error]);
  const selectPlot = (id: string) => { selected.current = id; setPlotId(id); setAllocations(data?.submissions.find((item) => item.plotId === id)?.allocations ?? [{ crop: "MOSH", area: 1, market: "UNKNOWN" }]); setStatus(""); };
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const revision = data?.submissions.find((item) => item.plotId === plotId)?.revision ?? 0;
      const response = await fetch("/api/planning", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key.current}` }, body: JSON.stringify({ plotId, season, mode, revision, allocations }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.code ?? "FAILED");
      await load(); setStatus(m.saved);
    } catch (error) { setStatus(errorText(error instanceof Error ? error.message : "FAILED")); }
    finally { setBusy(false); }
  }
  const changeAllocation = (index: number, patch: Partial<Allocation>) => setAllocations((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row));
  const input = "mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-2";
  const panel = "min-w-0 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6";
  return <div className="space-y-6">
    <h1 className="text-2xl font-semibold">{m.title}</h1>
    <aside className="rounded-xl border border-amber-300 bg-amber-50 p-4"><strong>{mode === "DEMO" ? m.demo : m.actual}</strong><p className="mt-2 text-sm">{m.scope}</p></aside>
    <div className="grid gap-4 sm:grid-cols-3">
      <label>{m.season}<input className={input} type="number" min="2000" max="2099" value={seasonDraft} onChange={(e) => setSeasonDraft(e.target.value)} onBlur={() => { if (/^20\d{2}$/.test(seasonDraft)) { setData(null); setSeason(seasonDraft); } else setSeasonDraft(season); }} /></label>
      <label>{m.source}<select className={input} value={mode} onChange={(e) => { setData(null); setMode(e.target.value as Plan["mode"]); setStatus(""); }}><option value="DEMO">{m.demo}</option><option value="USER_PLAN">{m.actual}</option></select></label>
      <div><label>{m.key}<input className={input} type="password" autoComplete="off" onChange={(e) => { key.current = e.target.value; }} /></label><button type="button" className="mt-2 text-sm underline" onClick={() => load().catch((e) => setStatus(errorText(e.message)))}>{m.refresh}</button></div>
    </div>
    <p className="text-sm text-slate-600">{m.keyHint}</p>
    <section className={panel}><h2 className="text-xl font-semibold">{m.stage1}</h2><Link className="mt-3 inline-block text-emerald-800 underline" href={`/${localePathSegments[locale]}/map`}>{m.suitability}</Link></section>
    <section className={panel}><h2 className="text-xl font-semibold">{m.stage2}</h2>
      {data ? <form onSubmit={save} className="mt-4 space-y-4">
        <label className="block">{m.plot}<select className={input} value={plotId} onChange={(e) => selectPlot(e.target.value)}>{data.plots.map((plot) => <option key={plot.id} value={plot.id}>{plot.farmName} · {plot.cadastralNumber} · {format(plot.area)} {dictionary.units.hectare}</option>)}</select></label>
        {allocations.map((row, index) => <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-[1fr_1fr_2fr_auto]">
          <label>{m.crop}<select className={input} value={row.crop} onChange={(e) => changeAllocation(index, { crop: e.target.value as Allocation["crop"] })}>{cropCodes.map((crop) => <option key={crop} value={crop}>{dictionary.recommendation.cropNames[crop]}</option>)}</select></label>
          <label>{m.area}<input className={input} type="number" required min="0.000001" step="any" value={row.area} onChange={(e) => changeAllocation(index, { area: Number(e.target.value) })} /></label>
          <label>{m.market}<select className={input} value={row.market} onChange={(e) => changeAllocation(index, { market: e.target.value as Allocation["market"] })}>{markets.map((market) => <option key={market} value={market}>{m[market]}</option>)}</select></label>
          <button className="self-end p-2 text-sm underline" type="button" disabled={allocations.length === 1} onClick={() => setAllocations((rows) => rows.filter((_, i) => i !== index))}>{m.remove}</button>
        </div>)}
        <p className="text-sm text-slate-600">{m.intent}</p>
        <div className="flex flex-wrap gap-3"><button type="button" className="rounded-lg border p-3" disabled={allocations.length >= 8} onClick={() => setAllocations((rows) => [...rows, { crop: cropCodes.find((crop) => !rows.some((row) => row.crop === crop)) ?? "MOSH", area: 1, market: "UNKNOWN" }])}>{m.add}</button><button className="rounded-lg bg-emerald-800 p-3 text-white disabled:opacity-50" disabled={busy || !plotId}>{busy ? m.loading : m.save}</button></div>
        {!data.storageReady ? <p className="text-xs text-slate-500">{m.storage}</p> : null}
      </form> : <p className="mt-3">{m.loading}</p>}
      {status ? <p className="mt-3 rounded-lg bg-slate-100 p-3" role="status">{status}</p> : null}
    </section>
    <section className={panel}><h2 className="text-xl font-semibold">{m.stage3}</h2><strong className="mt-3 block text-amber-900">{m.preview}</strong>
      <p className="mt-2">{m.coverage}: {format(data?.forecast.coverage ?? 0)}%</p><p className="text-sm">{m.threshold}</p>
      <p className="mt-2">{m.unknown}: {format(data?.forecast.unknownArea ?? null)} {dictionary.units.hectare}</p><p className="text-sm text-slate-600">{m.unknownHint}</p>
      <p className="mt-2 text-sm text-slate-600">{m.yieldHint}</p>
      <p className="mt-2 text-sm text-slate-600">{m.waterMissing}</p>
      {data?.forecast.ready ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{data.forecast.rows.filter((row) => row.area > 0 || row.demand !== null).map((row) => <article key={row.crop} className="min-w-0 rounded-xl border p-4"><h3 className="font-semibold">{dictionary.recommendation.cropNames[row.crop]}</h3><dl className="mt-3 space-y-2">{[[m.area, row.area], [m.production, row.production], [m.demand, row.demand], [m.deficit, row.deficit], [m.surplus, row.surplus]].map(([label, value]) => <div className="flex flex-wrap justify-between gap-2" key={String(label)}><dt>{label}</dt><dd className="font-semibold">{format(value as number | null)}</dd></div>)}</dl><p className="mt-3 text-sm">{m.adjustments}: {m[row.adjustment as "REVIEW_SURPLUS"]}</p><p className="mt-2 break-words text-xs text-slate-500">{m.source}: {row.sources.join("; ") || m.unavailable}{row.demandSource ? `; ${row.demandSource}` : ""}</p>{row.missingYieldArea > 0 ? <p className="mt-2 text-amber-900">{m.noYield}</p> : null}</article>)}</div> : null}
      <p className="mt-4 text-sm">{m.limits}</p>
      {data ? <p className="mt-2 text-xs text-slate-500">{new Intl.DateTimeFormat(intlLocales[locale], { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" }).format(new Date(data.calculatedAt))}</p> : null}
    </section>
    <section className={panel}>
      <h2 className="text-xl font-semibold">{m.stage4}</h2><p className="mt-3">{m.logistics}</p>
      {data?.options.length ? data.options.map((option) => <article key={`${option.crop}-${option.destination}`} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <strong>{mode === "DEMO" ? m.demo : m.preview}</strong><p>{dictionary.recommendation.cropNames[option.crop as Allocation["crop"]]} · {m.candidate}</p>
        <dl>{[[m.production, option.destinationProduction], [m.demand, option.destinationDemand], [m.trade, option.confirmedIncoming], [m.road, option.roadDistanceKm], [m.transfer, option.proposedTons]].map(([label, value]) => <div className="mt-2 flex flex-wrap justify-between gap-2" key={String(label)}><dt>{label}</dt><dd>{format(value as number | null)}</dd></div>)}</dl>
      </article>) : <article className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><strong>{mode === "DEMO" ? m.demo : m.unavailable}</strong><p className="mt-2">{m.candidate}</p><dl className="mt-3 space-y-2">{[m.production, m.demand, m.trade, m.road, m.transfer].map((label) => <div className="flex flex-wrap justify-between gap-2" key={label}><dt>{label}</dt><dd>{m.unavailable}</dd></div>)}</dl></article>}
      <p className="mt-3 text-sm">{m.limits}</p>
    </section>
  </div>;
}

"use client";

import type { Polygon } from "geojson";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PlotGeometryMetrics } from "@/gis/domain/plot-geometry-metrics";
import { intlLocales, localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { previousCropValues, waterSupplyValues } from "@/modules/plots/domain/plot-classification";
import type { PlotLookupMethod, PlotLookupRecord } from "@/modules/plots/domain/plot-lookup-source";
import type { ApiResponse } from "@/types/api";
import { formatDate, formatNumber } from "@/utils/format";

type PlotCreationFormProps = {
  geometry: Polygon;
  metrics: PlotGeometryMetrics;
  locale: Locale;
  dictionary: Dictionary;
  onCancel: () => void;
};

type LookupStatus = "idle" | "found" | "not-found";

export function PlotCreationForm({ geometry, metrics, locale, dictionary, onCancel }: PlotCreationFormProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [method, setMethod] = useState<PlotLookupMethod>("CADASTRAL_NUMBER");
  const [lookupValue, setLookupValue] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [lookupRecord, setLookupRecord] = useState<PlotLookupRecord | null>(null);
  const [cadastralNumber, setCadastralNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [farmName, setFarmName] = useState("");
  const [bonitet, setBonitet] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const numberLocale = intlLocales[locale];
  const hasOfficialBonitet = lookupStatus === "found" && lookupRecord?.bonitet !== null;

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const changeMethod = (nextMethod: PlotLookupMethod) => {
    setMethod(nextMethod);
    setLookupValue(nextMethod === "CADASTRAL_NUMBER" ? cadastralNumber : taxId);
    setLookupStatus("idle");
    setLookupRecord(null);
  };

  const findData = async () => {
    if (lookupValue.trim().length < 3) return;
    setIsLookingUp(true);
    setLookupStatus("idle");
    setLookupRecord(null);

    try {
      const search = new URLSearchParams({ method, value: lookupValue.trim() });
      const response = await fetch(`/api/plots/lookup?${search.toString()}`);
      const result = await response.json() as ApiResponse<PlotLookupRecord | null>;
      if (!response.ok || result.error) throw new Error("LOOKUP_FAILED");

      if (!result.data) {
        setCadastralNumber(method === "CADASTRAL_NUMBER" ? lookupValue.trim() : "");
        setTaxId(method === "TAX_ID" ? lookupValue.trim() : "");
        setFarmName("");
        setBonitet("");
        setLookupStatus("not-found");
        return;
      }

      setLookupRecord(result.data);
      setCadastralNumber(result.data.cadastralNumber);
      setTaxId(result.data.taxId);
      setFarmName(result.data.farmName);
      setBonitet(result.data.bonitet?.toString() ?? "");
      setLookupStatus("found");
    } catch {
      setCadastralNumber(method === "CADASTRAL_NUMBER" ? lookupValue.trim() : "");
      setTaxId(method === "TAX_ID" ? lookupValue.trim() : "");
      setFarmName("");
      setBonitet("");
      setLookupStatus("not-found");
    } finally {
      setIsLookingUp(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry,
          cadastralNumber,
          taxId,
          farmName,
          bonitet: Number(bonitet),
          waterSupply: form.get("waterSupply"),
          previousCrop: form.get("previousCrop"),
        }),
      });
      const result = await response.json() as ApiResponse<{ id: string }>;
      if (!response.ok || !result.data) throw new Error("CREATE_FAILED");
      router.push(`/${localePathSegments[locale]}/plot/${result.data.id}`);
    } catch {
      setError(dictionary.creation.saveError);
      setIsSaving(false);
    }
  };

  const fieldClass = "mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2";
  const foundFieldClass = `mt-1 w-full rounded-lg border px-3 py-2 ${lookupStatus === "found" ? "border-emerald-200 bg-emerald-50/60" : "border-[var(--border)] bg-white"}`;

  return (
    <section ref={sectionRef} className="scroll-mt-24 border-t border-[var(--border)] bg-white p-6" aria-labelledby="plot-creation-title">
      <h2 id="plot-creation-title" className="text-xl font-semibold">{dictionary.creation.formTitle}</h2>
      <dl className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div><dt className="text-slate-500">{dictionary.creation.area}</dt><dd className="font-medium">{formatNumber(metrics.areaHectares, numberLocale)} {dictionary.units.hectare}</dd></div>
        <div><dt className="text-slate-500">{dictionary.creation.center}</dt><dd className="font-medium">{metrics.center.map((value) => formatNumber(value, numberLocale)).join(", ")}</dd></div>
        <div><dt className="text-slate-500">{dictionary.creation.boundingBox}</dt><dd className="font-medium">{metrics.boundingBox.southWest.map((value) => formatNumber(value, numberLocale)).join(", ")} — {metrics.boundingBox.northEast.map((value) => formatNumber(value, numberLocale)).join(", ")}</dd></div>
        {lookupRecord && lookupRecord.areaHectares !== null ? <div><dt className="text-slate-500">{dictionary.creation.registryArea}</dt><dd className="font-medium">{formatNumber(lookupRecord.areaHectares, numberLocale)} {dictionary.units.hectare}</dd></div> : null}
      </dl>

      <div className="mt-5">
        <p className="text-sm font-medium">{dictionary.creation.searchMethod}</p>
        <div className="mt-2 inline-flex rounded-lg border border-[var(--border)] bg-slate-50 p-1">
          {(["CADASTRAL_NUMBER", "TAX_ID"] as const).map((item) => (
            <button
              key={item}
              className={`rounded-md px-3 py-2 text-sm font-medium ${method === item ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-600"}`}
              type="button"
              aria-pressed={method === item}
              onClick={() => changeMethod(item)}
            >
              {item === "CADASTRAL_NUMBER" ? dictionary.creation.cadastralNumber : dictionary.creation.taxId}
            </button>
          ))}
        </div>
        <div className="mt-3 flex max-w-2xl flex-col gap-2 sm:flex-row">
          <label className="flex-1 text-sm font-medium">
            {method === "CADASTRAL_NUMBER" ? dictionary.creation.cadastralNumber : dictionary.creation.taxId}
            <input className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2" value={lookupValue} onChange={(event) => setLookupValue(event.target.value)} />
          </label>
          <button className="self-end rounded-lg border border-[var(--primary)] px-4 py-2 font-medium text-[var(--primary)] disabled:opacity-60" type="button" disabled={isLookingUp || lookupValue.trim().length < 3} onClick={findData}>
            {dictionary.creation.findData}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">{dictionary.creation.lookupHint}</p>
        {lookupStatus === "found" ? <p className="mt-2 text-sm font-medium text-emerald-700" role="status">✓ {dictionary.creation.dataFound}</p> : null}
        {lookupStatus === "not-found" ? <p className="mt-2 text-sm text-amber-700" role="status">{dictionary.creation.dataNotFound}</p> : null}
      </div>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-sm font-medium">{dictionary.creation.cadastralNumber}<input className={foundFieldClass} value={cadastralNumber} onChange={(event) => setCadastralNumber(event.target.value)} required minLength={3} maxLength={100} /></label>
        <label className="text-sm font-medium">{dictionary.creation.taxId}<input className={foundFieldClass} value={taxId} onChange={(event) => setTaxId(event.target.value)} required minLength={3} maxLength={30} /></label>
        <label className="text-sm font-medium sm:col-span-2">{dictionary.creation.farmName}<input className={foundFieldClass} value={farmName} onChange={(event) => setFarmName(event.target.value)} required minLength={2} maxLength={160} /></label>
        <label className="text-sm font-medium">
          {dictionary.creation.bonitet}
          <input className={foundFieldClass} value={bonitet} onChange={(event) => setBonitet(event.target.value)} type="number" required min={0} max={100} step="0.01" readOnly={hasOfficialBonitet} />
          <span className={`mt-1 block text-xs ${hasOfficialBonitet ? "text-emerald-700" : "text-slate-500"}`}>{hasOfficialBonitet ? dictionary.creation.officialData : dictionary.creation.manualData}</span>
          {hasOfficialBonitet && lookupRecord?.bonitetSource ? <span className="block text-xs text-slate-500">{dictionary.creation.source}: {lookupRecord.bonitetSource}</span> : null}
          {hasOfficialBonitet && lookupRecord?.bonitetValidAt ? <span className="block text-xs text-slate-500">{dictionary.creation.validAt}: {formatDate(lookupRecord.bonitetValidAt, numberLocale)}</span> : null}
        </label>
        <label className="text-sm font-medium">{dictionary.creation.waterSupply}<select className={fieldClass} name="waterSupply" required defaultValue=""><option value="" disabled>—</option>{waterSupplyValues.map((value) => <option key={value} value={value}>{dictionary.creation.waterOptions[value]}</option>)}</select></label>
        <label className="text-sm font-medium sm:col-span-2">{dictionary.creation.previousCrop}<select className={fieldClass} name="previousCrop" required defaultValue=""><option value="" disabled>—</option>{previousCropValues.map((value) => <option key={value} value={value}>{dictionary.creation.cropOptions[value]}</option>)}</select></label>
        {error ? <p className="text-sm text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
        <div className="flex gap-3 sm:col-span-2">
          <button className="rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white disabled:opacity-60" type="submit" disabled={isSaving}>{dictionary.creation.save}</button>
          <button className="rounded-lg border border-[var(--border)] px-4 py-2.5 font-medium" type="button" onClick={onCancel}>{dictionary.creation.cancel}</button>
        </div>
      </form>
    </section>
  );
}

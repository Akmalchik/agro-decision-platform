import { intlLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatNumber } from "@/utils/format";

export type PlotDetailsData = {
  cadastralNumber: string;
  farmName: string;
  area: string;
  bonitet: string | null;
  specialization: string | null;
  taxId?: string | null;
  waterSupply?: string | null;
  previousCrop?: string | null;
};

export function PlotDetails({ plot, locale, dictionary }: { plot: PlotDetailsData; locale: Locale; dictionary: Dictionary }) {
  const rows = [
    [dictionary.plot.cadastralNumber, plot.cadastralNumber],
    [dictionary.plot.farmName, plot.farmName],
    [dictionary.plot.area, `${formatNumber(plot.area, intlLocales[locale])} ${dictionary.units.hectare}`],
    [dictionary.plot.bonitet, plot.bonitet ? `${formatNumber(plot.bonitet, intlLocales[locale])} ${dictionary.units.points}` : dictionary.empty.notSpecified],
    [dictionary.plot.specialization, plot.specialization ?? dictionary.empty.notSpecifiedFeminine],
  ];

  if ("taxId" in plot) rows.push([dictionary.creation.taxId, plot.taxId ?? dictionary.empty.notSpecified]);
  if ("waterSupply" in plot) {
    const value = plot.waterSupply && plot.waterSupply in dictionary.creation.waterOptions
      ? dictionary.creation.waterOptions[plot.waterSupply as keyof typeof dictionary.creation.waterOptions]
      : plot.waterSupply;
    rows.push([dictionary.plot.waterSupply, value ?? dictionary.empty.notSpecifiedFeminine]);
  }
  if ("previousCrop" in plot) {
    const value = plot.previousCrop && plot.previousCrop in dictionary.creation.cropOptions
      ? dictionary.creation.cropOptions[plot.previousCrop as keyof typeof dictionary.creation.cropOptions]
      : plot.previousCrop;
    rows.push([dictionary.plot.previousCrop, value ?? dictionary.empty.notSpecifiedFeminine]);
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-sm text-slate-500">{label}</dt>
          <dd className="mt-1 font-medium text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

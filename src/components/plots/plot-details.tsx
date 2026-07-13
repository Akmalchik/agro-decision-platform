import { formatArea } from "@/utils/format";

export type PlotDetailsData = {
  cadastralNumber: string;
  farmName: string;
  area: string;
  bonitet: string | null;
  specialization: string | null;
};

export function PlotDetails({ plot }: { plot: PlotDetailsData }) {
  const rows = [
    ["Кадастровый номер", plot.cadastralNumber],
    ["Фермерское хозяйство", plot.farmName],
    ["Площадь", formatArea(plot.area)],
    ["Бонитет", plot.bonitet ? `${plot.bonitet} баллов` : "Не указан"],
    ["Специализация", plot.specialization ?? "Не указана"],
  ];

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

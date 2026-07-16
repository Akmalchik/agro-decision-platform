import Link from "next/link";
import { notFound } from "next/navigation";
import { PlotDetails } from "@/components/plots/plot-details";
import { DataState } from "@/components/ui/data-state";
import { PageHeader } from "@/components/ui/page-header";
import { plotService } from "@/services/composition-root";

type PlotPageProps = { params: Promise<{ id: string }> };

export default async function PlotPage({ params }: PlotPageProps) {
  const { id } = await params;
  let plot;

  try {
    plot = await plotService.getById(id);
  } catch (error) {
    console.warn(`Unable to load plot ${id}.`, error);

    return (
      <div className="space-y-6">
        <PageHeader title="Карточка участка" description={`Идентификатор: ${id}`} />
        <DataState
          title="Данные временно недоступны"
          description="Не удалось подключиться к базе данных. Проверьте PostgreSQL/PostGIS и повторите попытку."
        />
        <Link className="inline-block font-medium text-[var(--primary)]" href="/map">← Вернуться к карте</Link>
      </div>
    );
  }

  if (!plot) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Карточка участка" description={plot.farmName} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <PlotDetails
          plot={{
            cadastralNumber: plot.cadastralNumber,
            farmName: plot.farmName,
            area: plot.area,
            bonitet: plot.soilProfile?.bonitet ?? null,
            specialization: plot.specialization,
          }}
        />
        <Link className="mt-5 inline-block font-medium text-[var(--primary)]" href="/map">← Вернуться к карте</Link>
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { PlotDetails } from "@/components/plots/plot-details";
import { PageHeader } from "@/components/ui/page-header";
import { plotService } from "@/services/composition-root";

type PlotPageProps = { params: Promise<{ id: string }> };

export default async function PlotPage({ params }: PlotPageProps) {
  const { id } = await params;
  const plot = await plotService.getById(id);

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

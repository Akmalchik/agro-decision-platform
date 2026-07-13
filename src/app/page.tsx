import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Республика Узбекистан"
        title="Платформа поддержки решений в сельском хозяйстве"
        description="Единая основа для работы с сельскохозяйственными участками и пространственными данными."
      />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Карта участков</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Картографический модуль подготовлен к дальнейшему подключению кадастровых данных.
        </p>
        <Link className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white" href="/map">
          Открыть карту
        </Link>
      </section>
    </div>
  );
}

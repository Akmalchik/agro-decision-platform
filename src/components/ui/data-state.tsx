type DataStateProps = {
  title: string;
  description: string;
};

export function DataState({ title, description }: DataStateProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm" role="status">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-600">{description}</p>
    </section>
  );
}

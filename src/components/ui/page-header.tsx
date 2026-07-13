type PageHeaderProps = { title: string; description?: string; eyebrow?: string };

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">{eyebrow}</p> : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 text-lg text-slate-600">{description}</p> : null}
    </header>
  );
}

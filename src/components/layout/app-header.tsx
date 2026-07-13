import Link from "next/link";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/map", label: "Карта" },
];

export function AppHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="font-semibold text-[var(--primary)]" href="/">Agro Platform</Link>
        <nav aria-label="Основная навигация">
          <ul className="flex gap-6">
            {navigation.map((item) => <li key={item.href}><Link className="text-sm font-medium hover:text-[var(--primary)]" href={item.href}>{item.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
